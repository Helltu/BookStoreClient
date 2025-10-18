import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favoriteIds, setFavoriteIds] = useState(() => {
        try {
            const item = window.localStorage.getItem('favoriteBooks');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('favoriteBooks', JSON.stringify(favoriteIds));
        } catch (error) {
            console.error(error);
        }
    }, [favoriteIds]);

    const addFavorite = (bookId) => {
        setFavoriteIds((prevIds) => {
            if (prevIds.includes(bookId)) {
                return prevIds;
            }
            return [...prevIds, bookId];
        });
    };

    const removeFavorite = (bookId) => {
        setFavoriteIds((prevIds) => prevIds.filter((id) => id !== bookId));
    };

    const isFavorite = (bookId) => {
        return favoriteIds.includes(bookId);
    };

    const toggleFavorite = (bookId) => {
        if (isFavorite(bookId)) {
            removeFavorite(bookId);
        } else {
            addFavorite(bookId);
        }
    };

    const value = {
        favoriteIds,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

