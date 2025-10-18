import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {FaShoppingCart} from 'react-icons/fa';
import {Bot} from 'lucide-react';
import logo from '../assets/logo_dark.png';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import Cart from './Cart';
import {useSearch} from '../api/SearchContext';

const Navbar = ({isAssistantOpen, onToggleAssistant, onCloseAssistant}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogoVisible, setIsLogoVisible] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const {searchTerm, setSearchTerm} = useSearch();
    const [inputValue, setInputValue] = useState(searchTerm);
    const userName = localStorage.getItem('userName') || 'Guest';
    const profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

    useEffect(() => {
        if (location.pathname === "/")
            return;
        setInputValue('');
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            setIsLogoVisible(window.innerWidth > 640);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearchTerm]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            setSearchTerm(inputValue.trim());
            navigate(`/`);
        }
    };

    const handleOpenCart = () => {
        if (isAssistantOpen) {
            console.log('Closing assistant before opening cart');
            onCloseAssistant();
        }
        setIsCartOpen(true);
    };

    return (
        <nav className="top-0 left-0 right-0 z-10 p-4 bg-white shadow-md">
            <div className="container mx-auto max-w-7xl px-4 flex justify-between items-center space-x-12">
                {/* Логотип и кнопка "Главная" */}
                <div className="flex items-center space-x-4">
                    {isLogoVisible ? (
                        <img
                            onClick={() => navigate('/')}
                            src={logo}
                            alt="Book Platform Logo"
                            className="h-10 w-auto cursor-pointer"
                            style={{objectFit: 'contain'}}
                        />
                    ) : null}
                    <Button variant="link" onClick={() => navigate('/')}>
                        Главная
                    </Button>
                    <Button variant="link" onClick={() => navigate('/user/orders')}>
                        Заказы
                    </Button>
                </div>

                {/* Поле ввода */}
                <div className="flex-grow mx-4">
                    <Input
                        placeholder="Введите название книги"
                        className="w-full max-w-lg overflow-hidden text-ellipsis whitespace-nowrap"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                </div>

                {/* Корзина, ассистент, профиль и выход */}
                <div className="flex items-center space-x-4">

                    <Button onClick={onToggleAssistant} variant="ghost" size="icon">
                        <Bot
                            className={`flex items-center space-x-4 ${isAssistantOpen ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                        />
                    </Button>

                    <button onClick={handleOpenCart} className="text-gray-600 hover:text-gray-800 text-2xl">
                        <FaShoppingCart/>
                    </button>

                    {/* Иконка профиля */}
                    <button onClick={() => navigate('/profile')} className="flex items-center" style={{
                        minWidth: "40px",
                    }}
                    >
                        <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="rounded-full border border-gray-300"
                            style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                            }}
                        />
                    </button>

                    <Button variant="destructive" onClick={handleLogout}>
                        Выйти
                    </Button>
                </div>
            </div>

            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} userId={localStorage.getItem('userId')}/>
        </nav>
    );
};

export default Navbar;
