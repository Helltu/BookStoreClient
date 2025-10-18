import React, {useState, useEffect, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from "@/components/ui/badge";
import {Textarea} from '@/components/ui/textarea';
import {Star, Heart} from 'lucide-react';
import axiosInstance from '@/api/axios';
import {useToast} from "@/hooks/use-toast";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import { useFavorites } from '@/api/FavoritesContext';

const BookDetailsPage = () => {
    const {toast} = useToast();
    const {id} = useParams();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [userId, setUserId] = useState(Number(localStorage.getItem('userId')));
    const [isInCart, setIsInCart] = useState(false);
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

    const fetchBookData = useCallback(async () => {
        setIsLoading(true);
        try {
            const detailsUrl = userId ? `/general/books/${id}/details?userId=${userId}` : `/general/books/${id}/details`;
            const bookDetailsResponse = await axiosInstance.get(detailsUrl);
            const bookDetails = bookDetailsResponse.data;

            setBook(bookDetails.book);
            setRating(bookDetails.rating);
            setGenres(bookDetails.genres);
            setMedia(bookDetails.media.sort((a, b) => a.id - b.id));
            setReviews(bookDetails.reviews);

            if (userId) {
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

                const cartResponse = await axiosInstance.get(`/client/${userId}/cart`);
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
            }
        } catch (error) {
            console.error('Ошибка загрузки данных книги:', error);
        } finally {
            setIsLoading(false);
        }
    }, [id, userId]);

    useEffect(() => {
        fetchBookData();

        if (userId) {
            const handleCartUpdate = () => fetchBookData();
            window.addEventListener('cart-updated', handleCartUpdate);
            return () => {
                window.removeEventListener('cart-updated', handleCartUpdate);
            };
        }
    }, [fetchBookData, userId]);

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
            window.dispatchEvent(new Event('cart-updated'));
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
        return <div className="text-center">Загрузка...</div>;
    }

    if (!book) {
        return <div className="text-center text-red-500">Не удалось загрузить информацию о книге.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="max-w-md mx-auto md:max-w-none">
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
                </div>

                <div>
                    <h1 className="text-3xl font-bold">{book.title}</h1>
                    <p className="text-xl text-gray-600 mt-2">{book.author}</p>

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

                    <p className="text-2xl font-bold mt-4">{book.cost} р.</p>
                    <p className={`mt-2 ${book.amt > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {book.amt > 0 ? `В наличии: ${book.amt} шт.` : 'Нет в наличии'}
                    </p>

                    <div className="mt-6 flex items-center gap-4">
                        {isInCart ? (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => handleQuantityChange(-1)}>-</Button>
                                <Input type="text" value={quantity} readOnly className="w-12 text-center"/>
                                <Button onClick={() => handleQuantityChange(1)}>+</Button>
                            </div>
                        ) : (
                            <Button onClick={handleAddToCart} disabled={book.amt <= 0} size="lg">
                                В корзину
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(book.id)}
                        >
                            <Heart className={`h-6 w-6 ${isFavorite(book.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </Button>
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

        </div>
    );
};

export default BookDetailsPage;
