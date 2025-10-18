import React, {useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Textarea} from '@/components/ui/textarea';
import {Star} from 'lucide-react';
import axiosInstance from '@/api/axios';
import {useToast} from '@/hooks/use-toast';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";

const AdminBookDetailsPage = () => {
    const {toast} = useToast();
    const {id} = useParams();

    const [bookDetails, setBookDetails] = useState(null);
    const [originalBook, setOriginalBook] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [hasDescriptionChanges, setHasDescriptionChanges] = useState(false);
    const [hasDetailsChanges, setHasDetailsChanges] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [covers] = useState(['Твердый', 'Мягкий']);
    const [allGenres, setAllGenres] = useState([]);

    const descriptionRef = useRef(null);

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const response = await axiosInstance.get(`/general/books/${id}/details`);
                const sortedMedia = [...response.data.media].sort((a, b) => a.id - b.id);

                setBookDetails({
                    ...response.data,
                    media: sortedMedia,
                });
                setOriginalBook(response.data.book);

                const allGenresResponse = await axiosInstance.get(`/general/genres`);

                const remainingGenres = allGenresResponse.data.filter(
                    (genre) => !response.data.genres.some((g) => g.id === genre.id)
                );
                setAllGenres(remainingGenres);
            } catch (error) {
                console.error('Ошибка загрузки данных книги:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookData();
    }, [id]);

    useEffect(() => {
        if (descriptionRef.current && bookDetails?.book?.description) {
            const textarea = descriptionRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    });

    const handleInputChange = (field, value) => {
        setBookDetails((prevDetails) => ({
            ...prevDetails,
            book: {
                ...prevDetails.book,
                [field]: value,
            },
        }));

        const isDescriptionChanged = field === 'description' && value !== originalBook.description;
        const isDetailsChanged =
            field !== 'description' &&
            (value !== originalBook[field] || (field === 'hardcover' && value !== originalBook.hardcover));

        setHasDescriptionChanges(isDescriptionChanged);
        setHasDetailsChanges((prev) => prev || isDetailsChanged);
    };

    const handleSaveChanges = async (type) => {
        try {
            const {book} = bookDetails;
            if (type === 'description' || type === 'details') {
                await axiosInstance.put(`/manager/books/${id}`, book);

                if (mediaFiles.length > 0) {
                    for (const file of mediaFiles) {
                        const formData = new FormData();
                        formData.append('media', file);

                        await axiosInstance.put(`/manager/books/${id}/media`, formData, {
                            headers: {'Content-Type': 'multipart/form-data'},
                        });
                    }

                    const updatedMediaResponse = await axiosInstance.get(`/general/books/${id}/media`);
                    setBookDetails((prevDetails) => ({
                        ...prevDetails,
                        media: updatedMediaResponse.data.sort((a, b) => a.id - b.id)
                    }));

                    setMediaFiles([]);
                    setPreviewImages([]);

                    const fileInput = document.querySelector('input[type="file"]');
                    if (fileInput) {
                        fileInput.value = '';
                    }
                }

                setOriginalBook({...book});
                setHasDescriptionChanges(false);
                setHasDetailsChanges(false);
            }
        } catch (error) {
            console.error('Не удалось сохранить изменения', error);
            return;
        }
        toast({
            title: 'Изменения сохранены',
            description: 'Данные книги успешно обновлены.',
            variant: 'success',
            className: 'bg-black text-white',
        });
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

    const handleResetChanges = (type) => {
        if (type === 'description') {
            setBookDetails((prevDetails) => ({
                ...prevDetails,
                book: {
                    ...prevDetails.book,
                    description: originalBook.description,
                },
            }));
            setHasDescriptionChanges(false);
            setMediaFiles([]);
            setPreviewImages([]);

            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
        } else if (type === 'details') {
            setBookDetails((prevDetails) => ({
                ...prevDetails,
                book: {...originalBook},
            }));
            setHasDetailsChanges(false);
        }
    };

    const handleDeleteMedia = async (mediaId) => {
        try {
            await axiosInstance.delete(`/manager/media/${mediaId}`);

            setBookDetails((prevDetails) => ({
                ...prevDetails,
                media: prevDetails.media.filter((media) => media.id !== mediaId),
            }));
        } catch (error) {
            console.error('Ошибка при удалении медиа:', error);
            return;
        }
        toast({
            title: 'Медиа удалено',
            description: 'Выбранный медиафайл успешно удалён.',
            variant: 'success',
            className: 'bg-black text-white',
        });
    };

    const handleDeleteLocalMedia = (index) => {
        setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleDeleteBook = async () => {
        try {
            await axiosInstance.delete(`/manager/books/${id}`);

            window.location.href = '/';
        } catch (error) {
            console.error('Ошибка при удалении книги:', error);
            return;
        }
        toast({
            title: 'Книга удалена',
            description: 'Книга успешно удалена.',
            variant: 'success',
            className: 'bg-black text-white',
        });
    };

    const handleAddGenre = async () => {
        try {
            if (!selectedGenre) return;

            await axiosInstance.put(`/manager/books/${id}/genres/${selectedGenre}`);

            toast({
                title: 'Жанр добавлен',
                description: 'Жанр успешно добавлен к книге.',
                variant: 'success',
                className: 'bg-black text-white',
            });

            const updatedGenresResponse = await axiosInstance.get(`/general/books/${id}/genres`);

            setBookDetails((prevDetails) => ({
                ...prevDetails,
                genres: updatedGenresResponse.data,
            }));

            const allGenresResponse = await axiosInstance.get(`/general/genres`);
            const remainingGenres = allGenresResponse.data.filter(
                (genre) => !updatedGenresResponse.data.some((g) => g.id === genre.id)
            );
            setAllGenres(remainingGenres);

            setIsDialogOpen(false);
            setSelectedGenre(null);
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось добавить жанр.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteGenre = async (genreId) => {
        try {
            await axiosInstance.delete(`/manager/books/${id}/genres/${genreId}`);

            toast({
                title: 'Жанр удалён',
                description: 'Жанр успешно удалён из книги.',
                variant: 'success',
                className: 'bg-black text-white',
            });

            const updatedGenresResponse = await axiosInstance.get(`/general/books/${id}/genres`);

            setBookDetails((prevDetails) => ({
                ...prevDetails,
                genres: updatedGenresResponse.data,
            }));

            const allGenresResponse = await axiosInstance.get(`/general/genres`);
            const remainingGenres = allGenresResponse.data.filter(
                (genre) => !updatedGenresResponse.data.some((g) => g.id === genre.id)
            );
            setAllGenres(remainingGenres);
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить жанр.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteReviewById = async (reviewUserId) => {
        try {
            await axiosInstance.delete(`/general/reviews`, {
                params: {
                    bookId: id,
                    userId: reviewUserId,
                },
            });
            setBookDetails((prevDetails) => ({
                ...prevDetails,
                reviews: prevDetails.reviews.filter((review) => review.userId !== reviewUserId),
            }));
            toast({
                title: 'Отзыв удалён',
                description: 'Выбранный отзыв успешно удалён.',
                variant: 'success',
                className: 'bg-black text-white',
            });
        } catch (error) {
            console.error('Не удалось удалить отзыв', error);
        }
    };

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

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="text-gray-600 text-center">Загрузка...</div>
            </div>
        );
    }

    if (!bookDetails) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="text-red-600 text-center">Не удалось загрузить данные книги.</div>
            </div>
        );
    }

    const {book, media, genres, rating, reviews} = bookDetails;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {book && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <Carousel className="w-full pb-8 max-h-fit">
                            <CarouselContent>
                                {media.map((img, index) => (
                                    <CarouselItem key={index} className="relative">
                                        <img
                                            src={`data:image/jpeg;base64,${img.media}`}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-auto object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleDeleteMedia(img.id)}
                                            className="absolute top-2 right-2 z-10 text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </CarouselItem>
                                ))}

                                {previewImages.map((imgSrc, index) => (
                                    <CarouselItem key={`local-${index}`} className="relative">
                                        <img
                                            src={imgSrc}
                                            alt={`New Media ${index + 1}`}
                                            className="w-full h-auto object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleDeleteLocalMedia(index)}
                                            className="absolute top-2 right-2 z-10 text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    </CarouselItem>
                                ))}
                                {(media.length === 0 && previewImages.length === 0) && (
                                    <CarouselItem>
                                        <img
                                            src="https://via.placeholder.com/600"
                                            alt="Placeholder"
                                            className="w-full h-auto object-cover rounded-lg"
                                        />
                                    </CarouselItem>
                                )}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-1/3 top-full transform -translate-y-1/2"/>
                            <CarouselNext className="absolute right-1/3 top-full transform -translate-y-1/2"/>
                        </Carousel>

                        <div>
                            <div className="flex justify-between">
                                <h1 className="text-3xl font-bold">{book.title}</h1>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteBook}
                                >
                                    Удалить книгу
                                </Button>
                            </div>
                            <p className="text-xl text-gray-600 mb-4">
                                {book.author}, {book.publicationYear}
                            </p>

                            <div className="flex items-center space-x-2 mb-4">
                                {renderStars(rating || 0)}
                                <p className="text-gray-700 text-lg font-medium ml-2">
                                    {rating?.toFixed(2) || 'N/A'}
                                </p>
                                {book.amt > 0 ? (
                                    <span className="text-lg text-green-500">В наличии</span>
                                ) : (
                                    <span className="text-lg text-red-500">Нет в наличии</span>
                                )
                                }
                            </div>

                            <Textarea
                                ref={descriptionRef}
                                className="text-gray-700 text-lg leading-relaxed resize-none overflow-hidden"
                                value={book.description}
                                onRender={(e)=>{
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                rows={1}
                            />

                            <div className="mt-2 text-2xl font-semibold text-gray-900">{book.cost} р.</div>

                            <div className="mt-4">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Добавить фото</h2>
                                <div className="space-y-4">
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e)}
                                        className="w-full cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between mt-4">
                                <Button
                                    variant={'destructive'}
                                    onClick={() => handleResetChanges('description')}
                                    disabled={!hasDescriptionChanges && mediaFiles.length === 0}
                                >
                                    Сбросить
                                </Button>
                                <Button
                                    onClick={() => handleSaveChanges('description')}
                                    disabled={!hasDescriptionChanges && mediaFiles.length === 0}
                                >
                                    Сохранить
                                </Button>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md col-span-full">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Основная информация</h2>
                            <div className="space-y-4 text-gray-700">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Название</span>
                                    <Input
                                        type="text"
                                        className="w-2/3 truncate"
                                        value={book.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Автор</span>
                                    <Input
                                        type="text"
                                        className="w-2/3 truncate"
                                        value={book.author}
                                        onChange={(e) => handleInputChange('author', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Издательство</span>
                                    <Input
                                        type="text"
                                        className="w-2/3 truncate"
                                        value={book.publisher}
                                        onChange={(e) => handleInputChange('publisher', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Год издания</span>
                                    <Input
                                        type="number"
                                        className="w-2/3 truncate"
                                        value={book.publicationYear}
                                        onChange={(e) =>
                                            handleInputChange('publicationYear', parseInt(e.target.value, 10))
                                        }
                                    />
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Страниц</span>
                                    <Input
                                        type="number"
                                        className="w-2/3 truncate"
                                        value={book.pages}
                                        onChange={(e) => handleInputChange('pages', parseInt(e.target.value, 10))}
                                    />
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Переплёт</span>
                                    <Select
                                        value={book.hardcover ? covers[0] : covers[1]}
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
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Количество в наличии</span>
                                    <Input
                                        type="number"
                                        className="w-2/3 truncate"
                                        value={book.amt}
                                        onChange={(e) => handleInputChange('amt', parseInt(e.target.value, 10))}
                                    />
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Стоимость, р.</span>
                                    <Input
                                        type="number"
                                        className="w-2/3 truncate"
                                        value={book.cost}
                                        onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Button
                                        variant={'destructive'}
                                        onClick={() => handleResetChanges('details')}
                                        disabled={!hasDetailsChanges}
                                    >
                                        Сбросить
                                    </Button>
                                    <Button
                                        onClick={() => handleSaveChanges('details')}
                                        disabled={!hasDetailsChanges}
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                                <div className="pt-4">
                                    <span className="font-medium block mb-2">Жанры:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((genre, index) => (
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
                                                        <Select onValueChange={setSelectedGenre}>
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
                            </div>
                        </div>
                    </div>

                    {/* Раздел отзывов */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">Отзывы</h2>
                        {reviews.length > 0 ? (
                            <div className="space-y-8">
                                {reviews.map((review, index) => (
                                    <div key={index} className="p-6 border rounded-lg">
                                        <p className="text-xl font-semibold text-gray-800">{review.userName}</p>
                                        <div className="flex items-center space-x-2 mb-2">
                                            {renderStars(review.rating)}
                                            <span className="text-lg font-medium text-gray-700 ml-2">
                                                {review.rating}
                                            </span>
                                        </div>
                                        <p className="text-lg text-gray-800">{review.text}</p>
                                        <div className="flex justify-end">
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDeleteReviewById(review.userId)}
                                            >
                                                Удалить
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Отзывов пока нет.</p>
                        )}
                    </div>
                </>
            )
            }
        </div>
    )
        ;
};

export default AdminBookDetailsPage;
