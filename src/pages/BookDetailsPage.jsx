import React, {useState, useEffect, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from "@/components/ui/badge";
import {Textarea} from '@/components/ui/textarea';
import {Star} from 'lucide-react';
import axiosInstance from '../api/axios';
import {useToast} from "@/hooks/use-toast";
import Cart from '@/components/Cart';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";

const BookDetailsPage = () => {
    const {toast} = useToast();
    const {id} = useParams();
    const [userId, setUserId] = useState(Number(localStorage.getItem('userId')));
    const [isInCart, setIsInCart] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [book, setBook] = useState(null);
    const [genres, setGenres] = useState([]);
    const [media, setMedia] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [hasChanges, setHasChanges] = useState(true);
    const [cartUpdated, setCartUpdated] = useState(0);

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const bookDetailsResponse = await axiosInstance.get(
                    `/general/books/${id}/details?userId=${userId}`
                );
                const cartResponse = await axiosInstance.get(`/client/${userId}/cart`);

                const bookDetails = bookDetailsResponse.data;
                setBook(bookDetails.book);
                setRating(bookDetails.rating);
                setGenres(bookDetails.genres);
                setMedia(bookDetails.media.sort((a, b) => a.id - b.id));
                setReviews(bookDetails.reviews);

                if (bookDetails.userReview) {
                    setUserReview(bookDetails.userReview);
                    setReviewRating(bookDetails.userReview.rating);
                    setReviewComment(bookDetails.userReview.text);
                    setHasChanges(false);
                } else {
                    setReviewRating(5);
                    setReviewComment('');
                    setHasChanges(true);
                }

                const cartItem = cartResponse.data.find(
                    (item) => item.bookId === bookDetails.book.id
                );
                if (cartItem) {
                    setIsInCart(true);
                    setQuantity(cartItem.amt);
                } else {
                    setIsInCart(false);
                    setQuantity(1);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных книги:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchBookData();
        }
    }, [id, userId, cartUpdated]);

    const updateRating = async () => {
        try {
            const ratingResponse = await axiosInstance.get(`/general/books/${id}/rating`);
            setRating(ratingResponse.data);
        } catch (error) {
            console.error("Не удалось обновить рейтинг:", error);
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prevQuantity) => {
            const newQuantity = prevQuantity + delta;
            return newQuantity >= 1 && newQuantity <= 9 ? newQuantity : prevQuantity;
        });
    };

    const handleCartUpdated = useCallback(() => {
        setCartUpdated((prev) => prev + 1);
    }, []);

    const handleAddToCart = async () => {
        try {
            const cartBookData = {
                userId: userId,
                bookId: book.id,
                amt: quantity,
            };

            await axiosInstance.post('/client/cart', cartBookData);

            setIsInCart(true);
            setQuantity(cartBookData.amt);
        } catch (error) {
            console.error("Ошибка при добавлении в корзину:", error);
            return;
        }
        toast({
            title: "Добавлено в корзину",
            description: `${quantity} копия книги "${book.title}" добавлено в корзину.`,
            variant: "success",
            className: "bg-black text-white",
        });
    };


    const handleSubmitReview = async () => {
        const reviewData = {
            bookId: parseInt(id),
            userId,
            rating: reviewRating,
            text: reviewComment,
        };

        try {
            if (userReview) {
                await axiosInstance.put(`/client/reviews`, reviewData);
                toast({
                    title: "Отзыв обновлен",
                    description: "Ваш отзыв успешно обновлен.",
                    variant: "success",
                    className: "bg-black text-white",
                });
            } else {
                await axiosInstance.post(`/client/reviews`, reviewData);
                toast({
                    title: "Отзыв отправлен",
                    description: "Ваш отзыв успешно опубликован.",
                    variant: "success",
                    className: "bg-black text-white",
                });
            }
            setUserReview(reviewData);
            setHasChanges(false);
            await updateRating();
        } catch (error) {
            console.error("Не удалось отправить отзыв:", error);
            toast({
                title: "Ошибка",
                description: "Не удалось отправить отзыв. Попробуйте позже.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteReview = async () => {
        try {
            await axiosInstance.delete(`/general/reviews?userId=${userId}&bookId=${id}`);
            setUserReview(null);
            setReviewRating(5);
            setReviewComment('');
            setHasChanges(true);
            toast({
                title: "Отзыв удален",
                description: "Ваш отзыв успешно удален.",
                variant: "success",
                className: "bg-black text-white",
            });
            await updateRating();
        } catch (error) {
            console.error("Не удалось удалить отзыв:", error);
            toast({
                title: "Ошибка",
                description: "Не удалось удалить отзыв. Попробуйте позже.",
                variant: "destructive",
            });
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

    useEffect(() => {
        const ratingChanged = reviewRating !== (userReview?.rating || 5);
        const commentChanged = reviewComment !== (userReview?.text || '');
        setHasChanges(ratingChanged || commentChanged);
    }, [reviewRating, reviewComment, userReview]);

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="text-gray-600 text-center">Загрузка...</div>
            </div>)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {book && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <Carousel className="w-full pb-8 max-h-fit">
                            <CarouselContent>
                                {media && media.length > 0 ? (
                                    media.map((img, index) => (
                                        <CarouselItem key={index}>
                                            <img
                                                src={`data:image/jpeg;base64,${img.media}`}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-auto object-cover rounded-lg"
                                            />
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
                            <CarouselPrevious className="absolute left-1/3 top-full transform -translate-y-1/2"/>
                            <CarouselNext className="absolute right-1/3 top-full transform -translate-y-1/2"/>
                        </Carousel>

                        <div>
                            <h1 className="text-3xl font-bold">{book.title}</h1>
                            <p className="text-xl text-gray-700 font-medium mb-4">{book.author}, {book.publicationYear}</p>

                            <div className="flex items-center space-x-2 mb-4">
                                {renderStars(rating || 0)}
                                <p className="text-gray-700 text-lg font-medium ml-2">{rating?.toFixed(2) || 'N/A'}</p>
                                {book.amt > 0 ? (
                                    <span className="text-lg text-green-500">В наличии</span>
                                ) : (
                                    <span className="text-lg text-red-500">Нет в наличии</span>
                                )
                                }
                            </div>

                            <p className="text-gray-700 text-lg mb-8 leading-relaxed break-words">{book.description}</p>

                            <div className="mt-2 text-2xl font-semibold text-gray-900">{book.cost} р.</div>

                            <div className="mt-6">
                                <div className="flex items-center space-x-4">
                                    <p className="font-semibold">Количество</p>
                                    <Button
                                        onClick={() => handleQuantityChange(-1)}
                                        size="icon"
                                        disabled={isInCart || quantity <= 1}
                                    >
                                        -
                                    </Button>

                                    <Input type="text" value={quantity} readOnly className="w-12 text-center"/>

                                    <Button
                                        onClick={() => handleQuantityChange(1)}
                                        size="icon"
                                        disabled={isInCart || quantity >= 9}
                                    >
                                        +
                                    </Button>
                                </div>

                                {isInCart ? (
                                    <Button onClick={() => setIsCartOpen(true)} className="w-full mt-4">
                                        В корзине
                                    </Button>
                                ) : (
                                    <Button onClick={handleAddToCart} className="w-full mt-4">
                                        В корзину
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md col-span-full">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Основная информация</h2>
                            <div className="space-y-4 text-gray-700">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Название</span>
                                    <span>{book.title}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Автор</span>
                                    <span>{book.author}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Издательство</span>
                                    <span>{book.publisher}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Год издания</span>
                                    <span>{book.publicationYear}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Страниц</span>
                                    <span>{book.pages}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Переплёт</span>
                                    <span>{book.hardcover ? 'Твёрдый' : 'Мягкий'}</span>
                                </div>
                                <div className="pt-4">
                                    <span className="font-medium block mb-2">Жанры:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((genre, index) => (
                                            <Badge key={index} className="px-3 py-2 bg-gray-700">
                                                {genre.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Review Section */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">
                            {userReview ? 'Отредактируйте свой отзыв' : 'Напишите отзыв'}
                        </h2>
                        <div className="p-6 border border-blue-300 rounded-lg mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className={`w-6 h-6 cursor-pointer fill-current ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'}`}
                                    />
                                ))}
                                <span className="text-lg font-semibold text-gray-700 ml-2">
                                    {reviewRating}
                                </span>
                            </div>
                            <Textarea
                                placeholder="Напишите свой отзыв здесь..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full mb-4 text-lg text-gray-800 resize-none overflow-hidden"
                                rows={4}
                            />
                            <div className="flex space-x-2">
                                <Button onClick={handleSubmitReview} disabled={!hasChanges}>
                                    {userReview ? 'Обновить отзыв' : 'Отправить отзыв'}
                                </Button>
                                {userReview && (
                                    <Button variant="destructive" onClick={handleDeleteReview}>
                                        Удалить отзыв
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-4">Отзывы</h2>
                        {userReview && (
                            <div className="p-6 border border-green-300 rounded-lg mb-8">
                                <p className="text-xl font-semibold text-gray-800">Ваш отзыв</p>
                                <div className="flex items-center space-x-2 mb-2">
                                    {renderStars(userReview.rating)}
                                    <span className="text-lg font-medium text-gray-700 ml-2">{userReview.rating}</span>
                                </div>
                                <p className="text-lg text-gray-800">{userReview.text}</p>
                            </div>
                        )}
                        {reviews.length > 0 ? (
                            <div className="space-y-8">
                                {reviews.map((review, index) => (
                                    <div key={index} className="p-6 border rounded-lg">
                                        <p className="text-xl font-semibold text-gray-800">{review.userName}</p>
                                        <div className="flex items-center space-x-2 mb-2">
                                            {renderStars(review.rating)}
                                            <span
                                                className="text-lg font-medium text-gray-700 ml-2">{review.rating}</span>
                                        </div>
                                        <p className="text-lg text-gray-800">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            (!userReview || reviews.length > 0) && (
                                <p className="text-center text-gray-500">Отзывов пока нет.</p>
                            )
                        )}
                    </div>
                </>
            )}

            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onCartUpdated={handleCartUpdated}
                userId={localStorage.getItem('userId')}
            />
        </div>
    );
};

export default BookDetailsPage;
