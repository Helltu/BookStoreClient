import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import logo from "../assets/logo_dark.png";

import { login, register } from "../api/auth";

const registrationSchema = z.object({
    email: z
        .string()
        .min(1, "Email обязателен")
        .email("Некорректный email"),
    password: z
        .string()
        .min(8, "Пароль должен быть не менее 8 символов")
        .regex(/[a-zA-Zа-яА-Я]/, "Пароль должен содержать буквы")
        .regex(/\d/, "Пароль должен содержать цифры")
        .regex(/^\S*$/, "Пароль не должен содержать пробелов"),
    confirmPassword: z.string().optional(),
    name: z.string().min(1, "Имя обязательно для заполнения"),
    surname: z.string().min(1, "Фамилия обязательна для заполнения"),
    phoneNumber: z
        .string()
        .regex(/^\+[0-9]{12}$/, "Введите корректный номер телефона"),
}).refine(
    (data) => data.password === data.confirmPassword || !data.confirmPassword,
    {
        path: ["confirmPassword"],
        message: "Пароли не совпадают",
    }
);

export default function AuthPage() {
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    const form = useForm({
        resolver: isRegister ? zodResolver(registrationSchema) : undefined,
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
            surname: "",
            phoneNumber: "+375",
        },
    });

    const { handleSubmit, control, reset, watch } = form;

    const handleAuth = async (data) => {
        try {
            const response = isRegister
                ? await register({
                    email: data.email,
                    password: data.password,
                    name: data.name,
                    surname: data.surname,
                    phoneNumber: data.phoneNumber,

                })
                : await login({
                    email: watch("email"),
                    password: watch("password"),
                });

            localStorage.setItem("userId", response.id);
            localStorage.setItem("userName", `${response.name} ${response.surname}`);
            localStorage.setItem("token", response.token);
            localStorage.setItem("isAdmin", JSON.stringify(response.isAdmin));

            navigate("/");
        } catch (error) {
            console.error("Ошибка авторизации:", error);
        }
    };

    const toggleAuthMode = () => {
        setIsRegister(!isRegister);
        reset();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
                <div className="w-full flex items-center justify-center">
                    <img src={logo} alt="Book Platform Logo" className="h-10 w-auto" />
                </div>
                <h2 className="text-2xl font-semibold text-center">
                    {isRegister ? "Регистрация" : "Вход"}
                </h2>

                <Form {...form}>
                    <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Пароль</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Введите пароль"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isRegister && (
                            <>
                                <FormField
                                    control={control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Подтверждение пароля</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Введите пароль еще раз"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Номер телефона</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type={"tel"}
                                                    placeholder="+375 (__) ___-__-__"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <div className="space-y-4">
                            <Button type="submit" className="w-full">
                                {isRegister ? "Зарегистрироваться" : "Войти"}
                            </Button>
                            <Button
                                variant="link"
                                type="button"
                                onClick={toggleAuthMode}
                                className="w-full text-center"
                            >
                                {isRegister ? "Уже есть аккаунт?" : "Создать аккаунт"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}