import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Star } from 'lucide-react';

const BookCard = ({ book }) => {
    const navigate = useNavigate();
    const [averageRating, setAverageRating] = useState(null);
    const [bookImage, setBookImage] = useState(null);

    useEffect(() => {
        axiosInstance.get(`/general/books/${book.id}/rating`)
            .then(response => setAverageRating(response.data))
            .catch(error => console.error("Ошибка при получении рейтинга:", error));

        axiosInstance.get(`/general/books/${book.id}/media`)
            .then(response => {
                if (response.data && response.data.length > 0) {
                    const mediaData = response.data.sort((a, b) => a.id - b.id)[0].media;
                    setBookImage(mediaData);
                }
            })
            .catch(error => console.error("Ошибка при получении медиа:", error));
    }, [book.id]);

    const renderStars = (rating) => {
        const roundedRating = Math.round(rating);
        return (
            <>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-6 h-6 ${i < roundedRating ? 'text-yellow-500' : 'text-gray-300'} fill-current`}
                    />
                ))}
            </>
        );
    };

    return (
        <div
            className="group relative border border-gray-200 p-4 rounded-lg hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/book/${book.id}`)}
        >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md group-hover:opacity-75">
                <img
                    src={bookImage ? `data:image/jpeg;base64,${bookImage}` : 'https://via.placeholder.com/250'}
                    alt={`Обложка книги ${book.title}`}
                    className="h-full w-full object-contain object-center"
                />
            </div>
            <div className="mt-4 flex justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-700">{book.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{book.author}</p>
                    {averageRating !== null && (
                        <div className="flex items-center mt-1">
                            {renderStars(averageRating)}
                            <span className="ml-2 text-sm text-gray-500">{averageRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{book.cost ? `${book.cost} р.` : 'Цена не указана'}</p>
            </div>
        </div>
    );
};

export default BookCard;
