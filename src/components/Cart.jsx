import React, {useState, useEffect} from 'react';
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import axiosInstance from '@/api/axios';
import CartBookItem from '@/components/CartBookItem';
import {useToast} from '@/hooks/use-toast';
import {useForm} from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from 'zod';
import {Input} from '@/components/ui/input';
import {Calendar} from '@/components/ui/calendar';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import {format, addDays} from 'date-fns';
import {Accordion, AccordionItem, AccordionContent, AccordionTrigger} from '@/components/ui/accordion';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import {CalendarIcon} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {ru} from "date-fns/locale";

const formSchema = z.object({
    deliveryAddress: z.string({
        required_error: "Пожалуйста, введите адрес доставки",
    }),
    deliveryDate: z.date({
        required_error: "Пожалуйста, выберите дату доставки",
    }),
    deliveryTime: z.string({
        required_error: "Пожалуйста, выберите время доставки"
    }),
    comment: z.string().optional(),
});


const OrderForm = ({userId, cartBooks, onClose}) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
    });
    const {toast} = useToast();
    const [popoverOpen, setPopoverOpen] = useState(false);

    const onSubmit = async (data) => {
        const orderDetails = cartBooks.map(book => ({bookId: book.bookId, amt: book.amt}));
        const orderData = {...data, userId, orderDetailsDTO: orderDetails};

        try {
            await axiosInstance.post('/client/orders', orderData);
        } catch (error) {
            console.log("Не удалось оформить заказ. Попробуйте снова.");
            return;
        }
        toast({
            title: "Заказ оформлен",
            description: "Ваш заказ успешно оформлен.",
            variant: "success",
            className: "bg-black text-white"
        });
        onClose();
    };

    const generateTimeOptions = () => {
        const times = [];
        let current = new Date();
        current.setHours(9, 0, 0, 0);
        const end = new Date();
        end.setHours(18, 0, 0, 0);

        while (current <= end) {
            times.push(format(current, "HH:mm"));
            current.setMinutes(current.getMinutes() + 30);
        }
        return times;
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Адрес доставки</FormLabel>
                            <FormControl>
                                <Input placeholder="Введите адрес доставки" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({field}) => (
                        <FormItem className="flex flex-col space-y-2">
                            <FormLabel>Дата доставки</FormLabel>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className="w-[280px] justify-start text-left font-normal"
                                            onClick={() => setPopoverOpen(!popoverOpen)}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4"/>
                                            {field.value ? format(field.value, "PPP", {locale: ru}) : "Выберите дату"}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            setPopoverOpen(false);
                                        }}
                                        locale={ru}
                                        disabled={(date) => date <= new Date() || date > addDays(new Date(), 7)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="deliveryTime"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Время доставки</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите время"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {generateTimeOptions().map((time, index) => (
                                            <SelectItem key={index} value={time} className={"cursor-pointer"}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="comment"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Комментарий</FormLabel>
                            <FormControl>
                                <Input placeholder="Комментарий (необязательно)" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type="submit" className={"w-full"}>Оформить заказ</Button>
            </form>
        </Form>
    );
}

const Cart = ({isOpen, onClose, userId, onCartUpdated}) => {
    const [cartBooks, setCartBooks] = useState([]);
    const {toast} = useToast();

    const fetchCartBooks = async () => {
        try {
            const response = await axiosInstance.get(`/client/${userId}/cart`);
            setCartBooks(response.data);
        } catch (error) {
            console.error("Ошибка загрузки корзины:", error);
        }
    };

    const updateBookQuantity = async (bookId, amt) => {
        try {
            const updatedBook = await axiosInstance.put('/client/cart', {userId, bookId, amt});
            setCartBooks((prevBooks) =>
                prevBooks.map((book) => (book.bookId === bookId ? {...book, amt: updatedBook.data.amt} : book))
            );
            if (onCartUpdated) {
                onCartUpdated();
            }
            window.dispatchEvent(new Event('cart-updated'));
        } catch (error) {
            console.error("Ошибка изменения количества:", error);
        }
    };

    const removeBookFromCart = async (bookId) => {
        try {
            await axiosInstance.delete('/client/cart', {data: {userId, bookId}});
            setCartBooks((prevBooks) => prevBooks.filter((book) => book.bookId !== bookId));
            toast({
                title: "Книга удалена",
                description: "Книга успешно удалена из корзины.",
                variant: "success",
                className: "bg-black text-white",
            });
            if (onCartUpdated) {
                onCartUpdated();
            }
            window.dispatchEvent(new Event('cart-updated'));
        } catch (error) {
            console.error("Ошибка удаления книги:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCartBooks();
        }
    }, [isOpen]);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Ваша корзина</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-200px)] my-4 pr-4">
                    <div className="p-4 space-y-4">
                        {cartBooks.length > 0 ? (
                            <>
                                {cartBooks.map((book) => (
                                    <CartBookItem
                                        key={book.bookId}
                                        book={book}
                                        updateQuantity={(amt) => updateBookQuantity(book.bookId, amt)}
                                        removeBook={() => removeBookFromCart(book.bookId)}
                                        onClose={onClose}
                                    />
                                ))}
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>Оформление заказа</AccordionTrigger>
                                        <AccordionContent className={"px-1"}>
                                            <OrderForm userId={userId} cartBooks={cartBooks} onClose={onClose}/>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </>
                        ) : (
                            <p className="text-center text-gray-500">Корзина пуста</p>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default Cart;
