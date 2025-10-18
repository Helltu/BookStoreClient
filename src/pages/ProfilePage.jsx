import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

const profileSchema = z
    .object({
        email: z.string().email("Некорректный email").min(1, "Email обязателен"),
        phoneNumber: z
            .string()
            .regex(/^\+[0-9]{12}$/, "Введите корректный номер телефона"), // Добавлена валидация номера телефона
        name: z.string().min(1, "Имя обязательно для заполнения"),
        surname: z.string().min(1, "Фамилия обязательна для заполнения"),
        password: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) =>
                    val === "" ||
                    (val.length >= 8 &&
                        /[a-zA-Zа-яА-Я]/.test(val) &&
                        /\d/.test(val) &&
                        !/\s/.test(val)),
                {
                    message:
                        "Пароль должен быть не менее 8 символов, содержать буквы и цифры, и не содержать пробелов",
                }
            ),
        confirmPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.password || data.confirmPassword) {
                return data.password === data.confirmPassword;
            }
            return true;
        },
        {
            message: "Пароли не совпадают",
            path: ["confirmPassword"],
        }
    );

const ProfilePage = () => {
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            email: "",
            phoneNumber: "",
            name: "",
            surname: "",
            password: "",
            confirmPassword: "",
        },
    });

    const { handleSubmit, control, reset, watch, formState } = form;

    const watchFields = watch(); // Watch all fields

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserId = localStorage.getItem("userId");
                if (!storedUserId) {
                    navigate("/login");
                    return;
                }

                setUserId(storedUserId);

                const response = await axiosInstance.get(
                    `/general/user/${storedUserId}`
                );
                const { email, phoneNumber, name, surname } = response.data;

                reset({
                    email,
                    phoneNumber,
                    name,
                    surname,
                    password: "",
                    confirmPassword: "",
                });
            } catch (error) {
                console.error("Ошибка при загрузке данных пользователя:", error);
                navigate("/login");
            }
        };

        fetchUserData();
    }, [navigate, reset]);

    const handleSaveChanges = async (data) => {
        const payload = { ...data };

        if (!payload.password) {
            delete payload.password;
            delete payload.confirmPassword;
        }

        try {
            await axiosInstance.put(`/general/user/${userId}`, payload);

            reset({
                email: data.email,
                phoneNumber: data.phoneNumber,
                name: data.name,
                surname: data.surname,
                password: "",
                confirmPassword: "",
            });

            toast({
                title: "Профиль обновлён",
                description: "Данные профиля успешно изменены.",
                variant: "success",
                className: "bg-black text-white",
            });
        } catch (error) {
            console.error("Ошибка при сохранении данных:", error);
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить изменения.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">
                Профиль
            </h1>
            <div className="flex flex-col sm:flex-row sm:space-x-8 items-center sm:items-start">
                {/* Аватарка */}
                <div className="w-full sm:w-1/3 max-w-xs text-center sm:text-left">
                    <img
                        src={`https://ui-avatars.com/api/?name=${watchFields.name}+${watchFields.surname}`}
                        alt="Avatar"
                        className="w-full rounded-full aspect-square border border-gray-300"
                    />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-800 text-center">
                        {watchFields.name} {watchFields.surname}
                    </h2>
                </div>

                {/* Форма редактирования */}
                <div className="flex-grow space-y-4 w-full">
                    <Form {...form}>
                        <form
                            onSubmit={handleSubmit(handleSaveChanges)}
                            className="space-y-4"
                        >
                            <FormField
                                control={control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Имя</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Введите имя" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="surname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Фамилия</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Введите фамилию" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Введите email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Номер телефона</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Введите номер телефона"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Новый пароль</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Введите новый пароль (если хотите сменить)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Подтверждение пароля</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Введите пароль ещё раз"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={!formState.isDirty}
                                    onClick={() => reset()}
                                    className="w-full sm:w-auto"
                                >
                                    Сбросить
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!formState.isDirty}
                                    className="w-full sm:w-auto"
                                >
                                    Сохранить
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
