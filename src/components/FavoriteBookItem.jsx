import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { useFavorites } from '@/api/FavoritesContext';
import { Button } from '@/components/ui/button';

const FavoriteBookItem = ({ bookId, onClose }) => {
    const navigate = useNavigate();
    const { removeFavorite } = useFavorites();
    const [bookData, setBookData] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [bookImage, setBookImage] = useState(null);

    useEffect(() => {
        axiosInstance.get(`/general/books/${bookId}`)
            .then(response => setBookData(response.data))
            .catch(error => console.error("Ошибка при получении данных книги:", error));

        axiosInstance.get(`/general/books/${bookId}/rating`)
            .then(response => setAverageRating(response.data))
            .catch(error => console.error("Ошибка при получении рейтинга:", error));

        axiosInstance.get(`/general/books/${bookId}/media`)
            .then(response => {
                if (response.data && response.data.length > 0) {
                    const mediaData = response.data.sort((a, b) => a.id - b.id)[0].media;
                    setBookImage(mediaData);
                }
            })
            .catch(error => console.error("Ошибка при получении медиа:", error));
    }, [bookId]);

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

    const handleNavigate = () => {
        onClose();
        navigate(`/book/${bookId}`);
    };

    if (!bookData) {
        return <div className="text-center text-gray-500">Загрузка...</div>;
    }

    return (
        <div className="group relative border border-gray-200 p-4 rounded-lg hover:shadow-lg flex items-start space-x-4 w-full">
            <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFavorite(bookId)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div
                className="w-24 h-36 overflow-hidden rounded-md flex-shrink-0 cursor-pointer"
                onClick={handleNavigate}
            >
                <img
                    src={bookImage ? `data:image/jpeg;base64,${bookImage}` : 'https://via.placeholder.com/150'}
                    alt={`Обложка книги ${bookData.title}`}
                    className="h-full w-full object-cover object-center"
                />
            </div>
            <div className="flex-grow flex flex-col h-36 justify-between" onClick={handleNavigate}>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 cursor-pointer pr-8">
                        {bookData.title}
                    </h3>
                    <p className="text-sm text-gray-500">{bookData.author}, {bookData.publicationYear}</p>
                    {averageRating !== null && (
                        <div className="flex items-center mt-1">
                            {renderStars(averageRating)}
                            <span className="ml-2 text-sm text-gray-500">{averageRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <div>
                    <p className={`text-sm font-medium ${bookData.amt > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {bookData.amt > 0 ? 'В наличии' : 'Нет в наличии'}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {bookData.cost.toFixed(2)} р.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FavoriteBookItem;
