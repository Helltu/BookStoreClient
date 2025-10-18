import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
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
import ApiSearchResultsPage from "@/pages/ApiSearchResultsPage";

const BookDetailsWrapper = () => {
    const { id } = useParams();
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    return isAdmin ? <Navigate to={`/admin/book/${id}`} /> : <BookDetailsPage />;
};

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


    return (
        <SearchProvider>
            <FavoritesProvider>
                <div className="flex min-h-screen">
                    <AssistantSidebar isOpen={isAssistantOpen} onClose={closeAssistant} />
                    <div className="flex-1">
                        {!isAuthPage && !isErrorPage && (isAdmin ? <AdminNavbar /> : <Navbar isAssistantOpen={isAssistantOpen} onToggleAssistant={toggleAssistant} onCloseAssistant={closeAssistant} />)}
                        <main>
                            <Routes>
                                <Route path="/login" element={<AuthPage />} />
                                <Route path="/" element={<Navigate to="/books" />} />
                                <Route path="/books" element={<BooksCatalogPage />} />
                                <Route path="/book/:id" element={<BookDetailsWrapper />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/orders" element={<UserOrdersPage />} />

                                {/* Admin Routes */}
                                <Route path="/admin/book/:id" element={isAdmin ? <AdminBookDetailsPage /> : <Navigate to="/books" />} />
                                <Route path="/admin/add-book" element={isAdmin ? <AdminAddBookPage /> : <Navigate to="/books" />} />
                                <Route path="/admin/genres" element={isAdmin ? <AdminGenresPage /> : <Navigate to="/books" />} />
                                <Route path="/admin/orders" element={isAdmin ? <AdminOrdersPage /> : <Navigate to="/books" />} />
                                <Route path="/admin/dashboard" element={isAdmin ? <DashboardPage /> : <Navigate to="/books" />} />
                                <Route path="/admin/api-search-results" element={isAdmin ? <ApiSearchResultsPage /> : <Navigate to="/books" />} />
                            </Routes>
                        </main>
                        <Toaster />
                    </div>
                </div>
            </FavoritesProvider>
        </SearchProvider>
    );
};

export default App;