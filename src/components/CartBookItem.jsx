import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';

const CartBookItem = React.memo(({ book, updateQuantity, removeBook, onClose }) => {
    const navigate = useNavigate();
    const [bookData, setBookData] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [bookImage, setBookImage] = useState(null);

    useEffect(() => {
        // Загрузка данных книги
        axiosInstance.get(`/general/books/${book.bookId}`)
            .then(response => setBookData(response.data))
            .catch(error => console.error("Ошибка при получении данных книги:", error));

        // Загрузка рейтинга
        axiosInstance.get(`/general/books/${book.bookId}/rating`)
            .then(response => setAverageRating(response.data))
            .catch(error => console.error("Ошибка при получении рейтинга:", error));

        // Загрузка изображения
        axiosInstance.get(`/general/books/${book.bookId}/media`)
            .then(response => {
                if (response.data && response.data.length > 0) {
                    const mediaData = response.data.sort((a, b) => a.id - b.id)[0].media;
                    setBookImage(mediaData);
                }
            })
            .catch(error => console.error("Ошибка при получении медиа:", error));
    }, [book.bookId]);

    const handleIncrease = useCallback(() => {
        if (book.amt < 9) updateQuantity(book.amt + 1);
    }, [book.amt, updateQuantity]);

    const handleDecrease = useCallback(() => {
        if (book.amt > 1) updateQuantity(book.amt - 1);
    }, [book.amt, updateQuantity]);

    const renderStars = (rating) => {
        const roundedRating = Math.round(rating);
        return (
            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < roundedRating ? 'text-yellow-500' : 'text-gray-300'} fill-current`}
                    />
                ))}
            </div>
        );
    };

    if (!bookData) {
        return <div className="text-center text-gray-500">Загрузка...</div>;
    }

    return (
        <div
            className="group relative border border-gray-200 p-4 rounded-lg hover:shadow-lg flex items-center space-x-4 w-full"
        >
            <div
                className="w-24 h-24 overflow-hidden rounded-md flex-shrink-0 cursor-pointer"
                onClick={() => {
                    onClose();
                    navigate(`/book/${book.bookId}`);
                }}
            >
                <img
                    src={bookImage ? `data:image/jpeg;base64,${bookImage}` : 'https://via.placeholder.com/150'}
                    alt={`Обложка книги ${bookData.title || 'Загрузка...'}`}
                    className="h-full w-full object-contain object-center"
                />
            </div>
            <div className="flex-grow flex flex-col">
                <h3
                    className="text-lg font-semibold text-gray-700 cursor-pointer"
                    onClick={() => {
                        onClose();
                        navigate(`/book/${book.bookId}`);
                    }}
                >
                    {bookData.title || 'Название не указано'}
                </h3>
                <p className="text-sm text-gray-500">{bookData.author || 'Автор не указан'}</p>
                {averageRating !== null && (
                    <div className="flex items-center mt-1">
                        {renderStars(averageRating)}
                        <span className="ml-2 text-sm text-gray-500">{averageRating.toFixed(1)}</span>
                    </div>
                )}
                <p className="text-sm font-medium text-gray-900 mt-1">
                    {bookData.cost ? `${bookData.cost} р.` : 'Цена не указана'}
                </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDecrease();
                        }}
                        size="icon"
                        disabled={book.amt <= 1}
                    >
                        -
                    </Button>
                    <Input type="text" value={book.amt} readOnly className="w-12 text-center" />
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleIncrease();
                        }}
                        size="icon"
                        disabled={book.amt >= 9}
                    >
                        +
                    </Button>
                </div>
                <Button
                    variant="destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeBook();
                    }}
                    className="mt-2 w-full"
                >
                    Удалить
                </Button>
            </div>
        </div>
    );
});

export default CartBookItem;
