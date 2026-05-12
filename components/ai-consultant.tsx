'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, MessageCircle, Send, Bot, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useRouter } from 'next/navigation';

const FAKE_MESSAGE = {
  role: 'assistant' as const,
  content: 'Привет! Если хочешь подобрать книгу или узнать статус заказа — пиши, помогу 📚',
};

export function AiConsultant() {
  const { open, messages, unread, setOpen, addMessage, markRead, showFake } = useChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const setWishlistCount = useWishlistStore((s) => s.setCount);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => showFake(FAKE_MESSAGE), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleOpen() {
    setOpen(true);
    markRead();
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addMessage({ role: 'user', content: text });
    setLoading(true);
    try {
      const res = await apiClient.post<{ response: string }>('/chat', { message: text });
      addMessage({ role: 'assistant', content: res.data.response });
      if (isAuthenticated) {
        apiClient
          .get('/users/me/wishlist', { skipErrorToast: true } as any)
          .then((r) => setWishlistCount((r.data || []).length))
          .catch(() => {});
      }
    } catch {
      addMessage({ role: 'assistant', content: 'Не удалось получить ответ. Попробуйте позже.' });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 focus:outline-none',
          open && 'hidden'
        )}
        aria-label="Открыть ИИ консультанта"
      >
        <MessageCircle className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {/* Side panel */}
      <div
        className={cn(
          'fixed bottom-0 right-0 z-50 flex h-full w-full flex-col bg-background shadow-2xl transition-transform duration-300 sm:h-screen sm:w-96 border-l border-border',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">ИИ Консультант</p>
            <p className="text-xs text-muted-foreground">Помогу с выбором книг</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {isAuthenticated ? (
          <div className="border-t border-border px-4 py-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity self-end"
              aria-label="Отправить"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-t border-border px-4 py-5 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Войдите в аккаунт, чтобы получить персональные рекомендации и узнать статус заказов
            </p>
            <button
              onClick={() => { setOpen(false); router.push('/login'); }}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              Войти
            </button>
          </div>
        )}
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
