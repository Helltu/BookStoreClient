import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const AssistantSidebar = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef(null);

    // Получаем userId из localStorage
    const userId = localStorage.getItem('userId') || 'anonymous';

    // Функция для прокрутки к последнему сообщению
    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            setTimeout(() => {
                const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) {
                    scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
                }
            }, 0);
        }
    };

    // Загружаем историю чата при открытии сайдбара
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                console.log('Fetching chat history for userId:', userId);
                const response = await axiosInstance.get(`/chat/history/${userId}`);
                // Фильтруем только сообщения USER и AI
                const historyMessages = response.data.messages
                    .filter((msg) => msg.type === 'USER' || msg.type === 'AI')
                    .map((msg, index) => ({
                        id: index + 1,
                        text: msg.text,
                        isUser: msg.isUser,
                    }));
                console.log('Filtered chat history loaded:', historyMessages);
                setMessages(historyMessages);
            } catch (error) {
                console.error('Ошибка при загрузке истории чата:', error);
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось загрузить историю чата.',
                    variant: 'destructive',
                });
            }
        };

        const token = localStorage.getItem('token');
        if (!isOpen || !token) {
            console.log('Skipping chat history load: panel closed or no token');
            return;
        }

        if (isOpen) {
            fetchChatHistory();
        }
    }, [isOpen, userId, toast]);

    // Автоскролл при изменении сообщений или состояния загрузки
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Функция для рендеринга текста с поддержкой Markdown
    const renderMarkdown = (text) => {
        // Парсим Markdown в HTML
        const rawHtml = marked(text, {
            breaks: true, // Поддержка переносов строк
            gfm: true,   // Поддержка GitHub Flavored Markdown
        });
        // Очищаем HTML для безопасности
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        return { __html: cleanHtml };
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: inputText,
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        scrollToBottom();

        try {
            console.log('Sending request to /chat with question:', userMessage.text);
            const response = await axiosInstance.post('/chat', {
                question: userMessage.text,
                userId: userId,
            });

            console.log('Received response:', response.data);
            const assistantMessage = {
                id: messages.length + 2,
                text: response.data.response,
                isUser: false,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            scrollToBottom();
        } catch (error) {
            console.error('Ошибка при отправке сообщения ассистенту:', error);
            let errorMessage = 'Не удалось получить ответ от ассистента.';
            if (error.response?.data?.includes('Ошибка при поиске книг')) {
                errorMessage = 'Не удалось найти книги по вашему запросу. Попробуйте уточнить жанр или другие критерии.';
            } else if (error.response?.data?.includes('Достигнут лимит запросов')) {
                errorMessage = 'Достигнут лимит запросов. Пожалуйста, попробуйте позже.';
            }
            toast({
                title: 'Ошибка',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div
            className={cn(
                'fixed top-0 left-0 h-full w-[400px] bg-white shadow-lg z-[100] transform transition-transform duration-300',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
        >
            <div className="flex flex-col h-full">
                {/* Заголовок и кнопка закрытия */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <Bot className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-semibold">Ассистент</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Область сообщений */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-center">Задайте свой вопрос ассистенту!</p>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'mb-4 p-3 rounded-lg',
                                    message.isUser ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                                )}
                            >
                                <div
                                    className="text-sm markdown-body"
                                    dangerouslySetInnerHTML={renderMarkdown(message.text)}
                                />
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="mb-4 p-3 rounded-lg bg-gray-100 mr-8">
                            <p className="text-sm text-gray-500">Ассистент думает...</p>
                        </div>
                    )}
                </ScrollArea>

                {/* Поле ввода и кнопка отправки */}
                <div className="p-4 border-t">
                    <div className="flex space-x-2">
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите ваш вопрос..."
                            disabled={isLoading}
                        />
                        <Button onClick={handleSendMessage} disabled={isLoading || !inputText.trim()}>
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantSidebar;