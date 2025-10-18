import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import axiosInstance from '@/api/axios';
import { useToast } from '@/hooks/use-toast';

const AdminAddBookPage = () => {
    const { toast } = useToast();

    const [bookDetails, setBookDetails] = useState({
        title: '',
        author: '',
        publisher: '',
        publicationYear: '',
        pages: '',
        amt: '',
        cost: '',
        hardcover: true,
        description: '',
    });

    const [covers] = useState(['Твердый', 'Мягкий']);
    const [allGenres, setAllGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axiosInstance.get('/general/genres');
                setAllGenres(response.data);
            } catch (error) {
                console.error('Ошибка загрузки жанров:', error);
            }
        };

        fetchGenres();
    }, []);

    const handleInputChange = (field, value) => {
        setBookDetails((prevDetails) => ({
            ...prevDetails,
            [field]: value,
        }));
    };

    const handleAddGenre = () => {
        if (selectedGenre && !selectedGenres.some((genre) => genre.id === selectedGenre)) {
            const genre = allGenres.find((g) => g.id === selectedGenre);
            setSelectedGenres((prevGenres) => [...prevGenres, genre]);
            setAllGenres((prevGenres) => prevGenres.filter((genre) => genre.id !== selectedGenre));
            setSelectedGenre(null);
            setIsDialogOpen(false);
        }
    };

    const handleDeleteGenre = (genreId) => {
        const genre = selectedGenres.find((g) => g.id === genreId);
        setSelectedGenres((prevGenres) => prevGenres.filter((genre) => genre.id !== genreId));
        setAllGenres((prevGenres) => [...prevGenres, genre]);
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setMediaFiles((prevFiles) => [...prevFiles, ...files]);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImages((prevImages) => [...prevImages, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDeleteMedia = (index) => {
        setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            const mediaPromises = mediaFiles.map(
                (file) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64String = reader.result.split(',')[1];
                            resolve(base64String);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
            );

            const mediaBase64 = await Promise.all(mediaPromises);

            const bookDTO = {
                ...bookDetails,
                publicationYear: parseInt(bookDetails.publicationYear, 10),
                pages: parseInt(bookDetails.pages, 10),
                amt: parseInt(bookDetails.amt, 10),
                cost: parseFloat(bookDetails.cost),
                genreIds: selectedGenres.map((genre) => genre.id),
                media: mediaBase64,
            };

            await axiosInstance.post('/manager/books', bookDTO);

            setBookDetails({
                title: '',
                author: '',
                publisher: '',
                publicationYear: '',
                pages: '',
                amt: '',
                cost: '',
                hardcover: true,
                description: '',
            });
            setMediaFiles([]);
            setPreviewImages([]);
            setSelectedGenres([]);

            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }

            const response = await axiosInstance.get('/general/genres');
            setAllGenres(response.data);
        } catch (error) {
            console.error('Не удалось добавить книгу', error);
            return;
        }
        toast({
            title: 'Книга добавлена',
            description: 'Новая книга успешно добавлена.',
            variant: 'success',
            className: 'bg-black text-white',
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Carousel className="w-full pb-8 max-h-fit">
                    <CarouselContent>
                        {previewImages.length > 0 ? (
                            previewImages.map((imgSrc, index) => (
                                <CarouselItem key={index} className="relative">
                                    <img
                                        src={imgSrc}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-auto object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => handleDeleteMedia(index)}
                                        className="absolute top-2 right-2 z-10 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem>
                                <img
                                    src="https://via.placeholder.com/600"
                                    alt="Placeholder"
                                    className="w-full h-auto object-cover rounded-lg"
                                />
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-1/3 top-full transform -translate-y-1/2" />
                    <CarouselNext className="absolute right-1/3 top-full transform -translate-y-1/2" />
                </Carousel>

                <div>
                    <h1 className="text-3xl font-bold mb-4">Добавление новой книги</h1>

                    <Textarea
                        className="text-gray-700 text-lg leading-relaxed resize-none overflow-hidden"
                        placeholder={"Описание книги"}
                        value={bookDetails.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        rows={1}
                    />

                    <div className="mt-4">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Добавить фото</h2>
                        <div className="space-y-4">
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e)}
                                className="w-full cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md col-span-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Детали</h2>
                    <div className="space-y-4 text-gray-700">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Название</span>
                            <Input
                                type="text"
                                className="w-2/3 truncate"
                                placeholder={"Название книги"}
                                value={bookDetails.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">Автор</span>
                            <Input
                                type="text"
                                className="w-2/3 truncate"
                                placeholder={"Автор книги"}
                                value={bookDetails.author}
                                onChange={(e) => handleInputChange('author', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Издательство</span>
                            <Input
                                type="text"
                                className="w-2/3 truncate"
                                placeholder={"Издательство книги"}
                                value={bookDetails.publisher}
                                onChange={(e) => handleInputChange('publisher', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Год издания</span>
                            <Input
                                type="number"
                                className="w-2/3 truncate"
                                placeholder={`Год издания с 1900 по ${new Date().getFullYear()}`}
                                value={bookDetails.publicationYear}
                                onChange={(e) => handleInputChange('publicationYear', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Страниц</span>
                            <Input
                                type="number"
                                className="w-2/3 truncate"
                                placeholder={`Количество страниц книги`}
                                value={bookDetails.pages}
                                onChange={(e) => handleInputChange('pages', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Количество в наличии</span>
                            <Input
                                type="number"
                                className="w-2/3 truncate"
                                placeholder={`Количество экземпляров книги в наличии`}
                                value={bookDetails.amt}
                                onChange={(e) => handleInputChange('amt', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Стоимость, р.</span>
                            <Input
                                type="number"
                                className="w-2/3 truncate"
                                placeholder={`Стоимость книги в рублях`}
                                value={bookDetails.cost}
                                onChange={(e) => handleInputChange('cost', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Переплёт</span>
                            <Select
                                value={bookDetails.hardcover ? covers[0] : covers[1]}
                                onValueChange={(value) => handleInputChange('hardcover', value === covers[0])}
                            >
                                <SelectTrigger className="w-2/3 truncate">
                                    <SelectValue placeholder="Выберите переплет"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {covers.map((cover) => (
                                        <SelectItem key={cover} value={cover}>
                                            {cover}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-4">
                            <span className="font-medium block mb-2">Жанры:</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedGenres.map((genre, index) => (
                                    <Badge
                                        key={index}
                                        className="px-3 py-2 flex items-center gap-2 cursor-pointer"
                                    >
                                        <span>{genre.name}</span>
                                        <button
                                            onClick={() => handleDeleteGenre(genre.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </Badge>
                                ))}
                                <Badge
                                    className="px-3 py-2 cursor-pointer"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    Добавить жанр
                                </Badge>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogContent className="max-w-md mx-auto">
                                        <DialogHeader>
                                            <DialogTitle>Добавить жанр</DialogTitle>
                                        </DialogHeader>
                                        <div className="my-4">
                                            {allGenres.length === 0 ? (
                                                <p className={'font-medium'}>Нет доступных жанров</p>
                                            ) : (
                                                <Select
                                                    onValueChange={(value) => setSelectedGenre(parseInt(value, 10))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите жанр"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allGenres.map((genre) => (
                                                            <SelectItem key={genre.id} value={genre.id}>
                                                                {genre.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                                Отмена
                                            </Button>
                                            <Button onClick={handleAddGenre} disabled={!selectedGenre}>
                                                Добавить
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSubmit}>Добавить книгу</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAddBookPage;
