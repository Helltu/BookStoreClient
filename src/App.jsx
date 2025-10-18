import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import BooksCatalogPage from '@/pages/BooksCatalogPage';
import BookDetailsPage from '@/pages/BookDetailsPage';
import AdminBookDetailsPage from '@/pages/AdminBookDetailsPage';
import AdminAddBookPage from '@/pages/AdminAddBookPage';
import ProfilePage from '@/pages/ProfilePage';
import Navbar from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import AdminGenresPage from '@/pages/AdminGenresPage';
import AdminOrdersPage from '@/pages/AdminOrdersPage';
import AssistantSidebar from "@/components/AssistantSidebar.jsx";
import { setupAxiosInterceptors } from '@/api/axios';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { SearchProvider } from '@/api/SearchContext';
import { FavoritesProvider } from '@/api/FavoritesContext';
import UserOrdersPage from '@/pages/UserOrdersPage';
import DashboardPage from "@/pages/DashboardPage.jsx";

const App = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    useEffect(() => {
        const initializeInterceptors = async () => {
            await setupAxiosInterceptors(toast);
            setIsLoading(false);
        };

        initializeInterceptors();
    }, []);

    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/login' && isAssistantOpen) {
            console.log('Closing assistant due to navigation to /login');
            setIsAssistantOpen(false);
        }
    }, [location.pathname, isAssistantOpen]);

    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const isAuthPage = location.pathname === '/login';
    const isErrorPage = location.pathname.startsWith('/error');

    const toggleAssistant = () => {
        setIsAssistantOpen((prev) => !prev);
    };

    const closeAssistant = () => {
        console.log('Closing assistant');
        setIsAssistantOpen(false);
    };

    if (isLoading) {
        return null;
    }

    const renderNavbar = () => {
        if (isAuthPage || isErrorPage) {
            return null;
        }
        if (isAdmin) {
            return <AdminNavbar />;
        }
        return <Navbar isAssistantOpen={isAssistantOpen} onToggleAssistant={toggleAssistant} onCloseAssistant={closeAssistant} />;
    };

    return (
        <FavoritesProvider>
            <SearchProvider>
                <div className="flex min-h-screen w-full flex-col">
                    {renderNavbar()}
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <Routes>
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/" element={<BooksCatalogPage />} />
                            <Route path="/profile" element={<ProfilePage />} />

                            {!isAdmin && (
                                <>
                                    <Route path="/book/:id" element={<BookDetailsPage />} />
                                    <Route path="/user/orders" element={<UserOrdersPage />} />
                                </>
                            )}

                            {isAdmin && (
                                <>
                                    <Route path="/book/:id" element={<AdminBookDetailsPage />} />
                                    <Route path="/admin/add-book" element={<AdminAddBookPage />} />
                                    <Route path="/admin/genres" element={<AdminGenresPage />} />
                                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                                    <Route path="/admin/dashboard" element={<DashboardPage />} />
                                </>
                            )}

                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                    <Toaster />
                    <AssistantSidebar isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
                </div>
            </SearchProvider>
        </FavoritesProvider>
    );
};

export default App;