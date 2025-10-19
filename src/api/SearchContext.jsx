import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const SearchContext = createContext(null);

export const useSearch = () => {
    const ctx = useContext(SearchContext);
    if (!ctx) throw new Error('useSearch must be used within SearchProvider');
    return ctx;
};

export const SearchProvider = ({ children }) => {
    // Инициализация из query string, чтобы значение не терялось при навигации
    const initQuery = (() => {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch {
            return '';
        }
    })();

    const [searchTerm, setSearchTerm] = useState(initQuery);

    // Синхронизируем q в URL без перезагрузки, чтобы состояние сохранялось при навигации
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (searchTerm) params.set('q', searchTerm);
            else params.delete('q');
            const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
            window.history.replaceState(null, '', newUrl);
        } catch {
            // noop
        }
    }, [searchTerm]);

    const value = useMemo(() => ({ searchTerm, setSearchTerm }), [searchTerm]);

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
