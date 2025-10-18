import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data that would come from an API
const mockBooks = [
    {
        id: 'mock1',
        title: 'Опасная игра бабули',
        authors: 'Кристен Перрин',
        publicationYear: 2024,
        cover_image: '/src/assets/mock_cover_1.png',
        description: 'Захватывающий триллер о бабушке с неожиданным прошлым.',
        pages: 320,
        cost: 16.16,
        publisher: 'Издательство АСТ',
        genres: 'Триллер, Детектив',
        rating: 5.0,
        amt: 10,
        hardcover: true,
    },
    {
        id: 'mock2',
        title: 'День, когда я научился жить',
        authors: 'Лоран Гунель',
        publicationYear: 2018,
        cover_image: 'https://placehold.co/150x220',
        description: 'История о том, как изменить свою жизнь к лучшему.',
        pages: 288,
        cost: 7.05,
        publisher: 'Издательство "Эксмо"',
        genres: 'Психология, Саморазвитие',
        rating: 4.8,
        amt: 15,
        hardcover: false,
    },
    {
        id: 'mock3',
        title: 'Кафе на краю земли',
        authors: 'Джон Стрелеки',
        publicationYear: 2010,
        cover_image: 'https://placehold.co/150x220',
        description: 'Книга, которая заставляет задуматься о смысле жизни.',
        pages: 160,
        cost: 8.48,
        publisher: 'Издательство "Манн, Иванов и Фербер"',
        genres: 'Философия, Мотивация',
        rating: 4.9,
        amt: 20,
        hardcover: true,
    }
];

const ApiSearchResultsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('q');

    const handleSelectBook = (book) => {
        navigate('/admin/add-book', { state: { bookData: book } });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Результаты поиска по API для "{searchQuery}"</h1>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockBooks.map((book) => (
                    <Card key={book.id}>
                        <CardHeader>
                            <CardTitle>{book.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img src={book.cover_image} alt={book.title} className="w-full h-auto object-cover mb-4" />
                            <p className="text-sm text-gray-600">{book.authors} ({book.publicationYear})</p>
                            <p className="mt-2 text-sm">{book.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleSelectBook(book)} className="w-full">Выбрать эту книгу</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ApiSearchResultsPage;

