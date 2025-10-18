import React, {useState, useEffect, useCallback, useReducer} from 'react';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../api/axios';
import BookCard from '../components/BookCard';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {debounce} from 'lodash';

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {FunnelIcon, PlusIcon} from '@heroicons/react/24/solid';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useToast} from '@/hooks/use-toast';
import {useSearch} from '../api/SearchContext';

const sortOptions = [
    {name: 'Популярности', value: 'popularity_desc'},
    {name: 'Рейтингу: по возрастанию', value: 'rating_asc'},
    {name: 'Рейтингу: по убыванию', value: 'rating_desc'},
    {name: 'Цене: по возрастанию', value: 'cost_asc'},
    {name: 'Цене: по убыванию', value: 'cost_desc'},
    {name: 'Названию: от А до Я', value: 'title_asc'},
    {name: 'Названию: от Я до А', value: 'title_desc'},
    {name: 'Году публикации: по возрастанию', value: 'publicationYear_asc'},
    {name: 'Году публикации: по убыванию', value: 'publicationYear_desc'},
];

const initialState = {
    books: [],
    temporaryFilters: {
        minCost: '',
        maxCost: '',
        minRating: '',
        maxRating: '',
        minPublicationYear: '',
        maxPublicationYear: '',
        minPages: '',
        maxPages: '',
        authors: [],
        publishers: [],
        genres: [],
    },
    filters: {
        minCost: '',
        maxCost: '',
        minRating: '',
        maxRating: '',
        minPublicationYear: '',
        maxPublicationYear: '',
        minPages: '',
        maxPages: '',
        authors: [],
        publishers: [],
        genres: [],
    },
    softcover: false,
    hardcover: false,
    endHardcover: null,
    sort: sortOptions[0].value,
    authorsList: [],
    publishersList: [],
    genresList: [],
    minCostRange: [0, 100],
    maxCostRange: [0, 100],
    minPagesRange: [0, 100],
    maxPagesRange: [0, 100],
    minRatingRange: [1, 5],
    maxRatingRange: [1, 5],
    minPublicationYearRange: [1900, new Date().getFullYear()],
    maxPublicationYearRange: [1900, new Date().getFullYear()],
    isSheetOpen: false,
    isLoading: true,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_BOOKS':
            return {...state, books: action.payload, isLoading: false};
        case 'SET_FILTER_DATA':
            return {
                ...state,
                ...action.payload,
            };
        case 'SET_TEMPORARY_FILTERS':
            return {...state, temporaryFilters: action.payload};
        case 'SET_FILTERS':
            return {...state, filters: action.payload};
        case 'SET_SORT':
            return {...state, sort: action.payload};
        case 'SET_IS_LOADING':
            return {...state, isLoading: action.payload};
        case 'TOGGLE_SHEET':
            return {...state, isSheetOpen: action.payload};
        case 'SET_COVER':
            return {...state, [action.payload.type]: action.payload.value};
        case 'SET_END_HARDCOVER':
            return {...state, endHardcover: action.payload};
        default:
            return state;
    }
}

const BooksCatalogPage = () => {
    const {toast} = useToast();
    const {searchTerm} = useSearch();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(reducer, initialState);
    const [isAdmin, setIsAdmin] = useState(false);

    const {
        books,
        temporaryFilters,
        filters,
        softcover,
        hardcover,
        endHardcover,
        sort,
        authorsList,
        publishersList,
        genresList,
        minCostRange,
        maxCostRange,
        minPagesRange,
        maxPagesRange,
        minRatingRange,
        maxRatingRange,
        minPublicationYearRange,
        maxPublicationYearRange,
        isSheetOpen,
        isLoading,
    } = state;

    const fetchBooks = useCallback(
        async () => {
            dispatch({type: 'SET_IS_LOADING', payload: true});
            try {
                const [sortBy, sortDirection] = sort.split('_');
                const params = {
                    ...filters,
                    title: searchTerm,
                    sortBy,
                    sortDirection,
                    authors: filters.authors.join(','),
                    publishers: filters.publishers.join(','),
                    genres: filters.genres.join(','),
                };
                if (endHardcover != null) params.hardcover = endHardcover;

                const searchParams = new URLSearchParams(params);

                const response = await axiosInstance.get(`/general/books/filtered?${searchParams}`);
                const filteredBooks = isAdmin
                    ? response.data
                    : response.data.filter((book) => book.amt > 0);

                dispatch({type: 'SET_BOOKS', payload: filteredBooks});
            } catch (error) {
                console.error('Ошибка при загрузке книг:', error);
            }
        },
        [filters, sort, endHardcover, searchTerm, isAdmin]
    );

    const fetchFilterData = useCallback(
        async () => {
            try {
                const response = await axiosInstance.get('/general/books/filters');
                dispatch({
                    type: 'SET_FILTER_DATA',
                    payload: {
                        minCostRange: [response.data.minCost, response.data.maxCost],
                        maxCostRange: [response.data.minCost, response.data.maxCost],
                        minPagesRange: [response.data.minPages, response.data.maxPages],
                        maxPagesRange: [response.data.minPages, response.data.maxPages],
                        minRatingRange: [response.data.minRating, response.data.maxRating],
                        maxRatingRange: [response.data.minRating, response.data.maxRating],
                        minPublicationYearRange: [response.data.minPublicationYear, response.data.maxPublicationYear],
                        maxPublicationYearRange: [response.data.minPublicationYear, response.data.maxPublicationYear],
                        authorsList: response.data.authors,
                        publishersList: response.data.publishers,
                        genresList: response.data.genres,
                    },
                });
            } catch (error) {
                console.error('Ошибка при загрузке данных фильтров:', error);
            }
        },
        []
    );

    useEffect(() => {
        const admin = localStorage.getItem('isAdmin');
        if (admin === 'true') {
            setIsAdmin(true);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchFilterData();
        } else {
            navigate('/login');
        }
    }, [fetchFilterData, navigate]);

    useEffect(() => {
        const debouncedFetch = debounce(fetchBooks, 300);
        debouncedFetch();

        return () => debouncedFetch.cancel();
    }, [fetchBooks]);

    const handleTemporaryFilterChange = (e) => {
        const {name, value, type, checked} = e.target;
        dispatch({
            type: 'SET_TEMPORARY_FILTERS',
            payload: {
                ...temporaryFilters,
                [name]: type === 'checkbox' ? checked : value === '' ? '' : Number(value),
            },
        });
    };

    const handleCoverChange = (type, checked) => {
        dispatch({type: 'SET_COVER', payload: {type, value: checked}});
    };

    const handleTemporaryCheckboxChange = (name, value) => {
        dispatch({
            type: 'SET_TEMPORARY_FILTERS',
            payload: {
                ...temporaryFilters,
                [name]: temporaryFilters[name].includes(value)
                    ? temporaryFilters[name].filter((item) => item !== value)
                    : [...temporaryFilters[name], value],
            },
        });
    };

    const applyFilters = () => {
        dispatch({type: 'SET_FILTERS', payload: temporaryFilters});

        if (!(softcover === false && hardcover === false) && !(softcover === true && hardcover === true)) {
            dispatch({type: 'SET_END_HARDCOVER', payload: hardcover});
        } else {
            dispatch({type: 'SET_END_HARDCOVER', payload: null});
        }

        toast({
            title: 'Фильтры применены',
            description: `Выбранные вами фильтры успешно применены`,
            variant: 'success',
            className: 'bg-black text-white',
        });
        dispatch({type: 'TOGGLE_SHEET', payload: false});
    };

    const clearFilters = () => {
        dispatch({type: 'SET_TEMPORARY_FILTERS', payload: initialState.temporaryFilters});
        dispatch({type: 'SET_COVER', payload: {type: 'softcover', value: false}});
        dispatch({type: 'SET_COVER', payload: {type: 'hardcover', value: false}});
        dispatch({type: 'SET_END_HARDCOVER', payload: null});
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold">Каталог книг</h1>
                    <div className="flex items-center space-x-4">
                        {/* Кнопка добавления книги для администратора */}
                        {isAdmin && (
                            <Button
                                onClick={() => navigate('/admin/add-book')}
                                className="flex items-center space-x-1"
                            >
                                <PlusIcon className="h-5 w-5"/>
                                <span>Добавить книгу</span>
                            </Button>
                        )}
                        {/* Панель фильтров */}
                        <Sheet open={isSheetOpen}
                               onOpenChange={(open) => dispatch({type: 'TOGGLE_SHEET', payload: open})}>
                            <SheetTrigger asChild>
                                <div>
                                    <Button onClick={() => dispatch({type: 'TOGGLE_SHEET', payload: true})}>
                                        <FunnelIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
                                        Фильтры
                                    </Button>
                                </div>
                            </SheetTrigger>
                        </Sheet>

                        <Select onValueChange={(value) => dispatch({type: 'SET_SORT', payload: value})} value={sort}>
                            <SelectTrigger
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-[180px]">
                                <SelectValue placeholder="Сортировка"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Сортировать по</SelectLabel>
                                    {sortOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <section className="pb-16 pt-6">
                    <div className="text-gray-600 text-center">Загрузка...</div>
                </section>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Сортировка и отображение книг */}
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold">Каталог книг</h1>
                <div className="flex items-center space-x-4">
                    {/* Кнопка добавления книги для администратора */}
                    {isAdmin && (
                        <Button
                            onClick={() => navigate('/admin/add-book')}
                            className="flex items-center space-x-1"
                        >
                            <PlusIcon className="h-5 w-5"/>
                            <span>Добавить книгу</span>
                        </Button>
                    )}
                    {/* Панель фильтров */}
                    <Sheet open={isSheetOpen} onOpenChange={(open) => dispatch({type: 'TOGGLE_SHEET', payload: open})}>
                        <SheetTrigger asChild>
                            <div>
                                <Button onClick={() => dispatch({type: 'TOGGLE_SHEET', payload: true})}>
                                    <FunnelIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
                                    Фильтры
                                </Button>
                            </div>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Фильтры</SheetTitle>
                                <SheetDescription>Настройте фильтры, чтобы отобразить подходящие
                                    книги.</SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-200px)] my-4 pr-4">
                                {/* Форма фильтров */}
                                <form className="space-y-4 mx-1">
                                    {/* Цена */}
                                    <div className="space-y-2">
                                        <Label>Цена (мин)</Label>
                                        <Input
                                            type="number"
                                            name="minCost"
                                            value={temporaryFilters.minCost}
                                            onChange={handleTemporaryFilterChange}
                                            min={minCostRange[0]}
                                            max={maxCostRange[1]}
                                            placeholder={`${minCostRange[0]}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Цена (макс)</Label>
                                        <Input
                                            type="number"
                                            name="maxCost"
                                            value={temporaryFilters.maxCost}
                                            onChange={handleTemporaryFilterChange}
                                            min={minCostRange[0]}
                                            max={maxCostRange[1]}
                                            placeholder={`${maxCostRange[1]}`}
                                        />
                                    </div>
                                    {/* Рейтинг */}
                                    <div className="space-y-2">
                                        <Label>Рейтинг (мин)</Label>
                                        <Input
                                            type="number"
                                            name="minRating"
                                            value={temporaryFilters.minRating}
                                            onChange={handleTemporaryFilterChange}
                                            min={minRatingRange[0]}
                                            max={maxRatingRange[1]}
                                            placeholder={`${minRatingRange[0]}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Рейтинг (макс)</Label>
                                        <Input
                                            type="number"
                                            name="maxRating"
                                            value={temporaryFilters.maxRating}
                                            onChange={handleTemporaryFilterChange}
                                            min={minRatingRange[0]}
                                            max={maxRatingRange[1]}
                                            placeholder={`${maxRatingRange[1]}`}
                                        />
                                    </div>
                                    {/* Год публикации */}
                                    <div className="space-y-2">
                                        <Label>Год публикации (мин)</Label>
                                        <Input
                                            type="number"
                                            name="minPublicationYear"
                                            value={temporaryFilters.minPublicationYear}
                                            onChange={handleTemporaryFilterChange}
                                            min={minPublicationYearRange[0]}
                                            max={maxPublicationYearRange[1]}
                                            placeholder={`${minPublicationYearRange[0]}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Год публикации (макс)</Label>
                                        <Input
                                            type="number"
                                            name="maxPublicationYear"
                                            value={temporaryFilters.maxPublicationYear}
                                            onChange={handleTemporaryFilterChange}
                                            min={minPublicationYearRange[0]}
                                            max={maxPublicationYearRange[1]}
                                            placeholder={`${maxPublicationYearRange[1]}`}
                                        />
                                    </div>
                                    {/* Страницы */}
                                    <div className="space-y-2">
                                        <Label>Страницы (мин)</Label>
                                        <Input
                                            type="number"
                                            name="minPages"
                                            value={temporaryFilters.minPages}
                                            onChange={handleTemporaryFilterChange}
                                            min={minPagesRange[0]}
                                            max={maxPagesRange[1]}
                                            placeholder={`${minPagesRange[0]}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Страницы (макс)</Label>
                                        <Input
                                            type="number"
                                            name="maxPages"
                                            value={temporaryFilters.maxPages}
                                            onChange={handleTemporaryFilterChange}
                                            min={minPagesRange[0]}
                                            max={maxPagesRange[1]}
                                            placeholder={`${maxPagesRange[1]}`}
                                        />
                                    </div>
                                    {/* Переплёт */}
                                    <div className="space-y-2">
                                        <Label>Переплёт</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="softcover"
                                                checked={softcover}
                                                onCheckedChange={(checked) => handleCoverChange('softcover', checked)}
                                            />
                                            <Label className={"cursor-pointer"} htmlFor="softcover">Мягкий</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hardcover"
                                                checked={hardcover}
                                                onCheckedChange={(checked) => handleCoverChange('hardcover', checked)}
                                            />
                                            <Label className={"cursor-pointer"} htmlFor="hardcover">Твёрдый</Label>
                                        </div>
                                    </div>
                                    {/* Авторы */}
                                    <div className="space-y-2">
                                        <Label>Авторы</Label>
                                        {authorsList.map((author) => (
                                            <div key={author} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`author-${author}`}
                                                    checked={temporaryFilters.authors.includes(author)}
                                                    onCheckedChange={() => handleTemporaryCheckboxChange('authors', author)}
                                                />
                                                <Label className={"cursor-pointer"}
                                                       htmlFor={`author-${author}`}>{author}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Издательства */}
                                    <div className="space-y-2">
                                        <Label>Издательства</Label>
                                        {publishersList.map((publisher) => (
                                            <div key={publisher} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`publisher-${publisher}`}
                                                    checked={temporaryFilters.publishers.includes(publisher)}
                                                    onCheckedChange={() => handleTemporaryCheckboxChange('publishers', publisher)}
                                                />
                                                <Label className={"cursor-pointer"}
                                                       htmlFor={`publisher-${publisher}`}>{publisher}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Жанры */}
                                    <div className="space-y-2">
                                        <Label>Жанры</Label>
                                        {genresList.map((genre) => (
                                            <div key={genre} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`genre-${genre}`}
                                                    checked={temporaryFilters.genres.includes(genre)}
                                                    onCheckedChange={() => handleTemporaryCheckboxChange('genres', genre)}
                                                />
                                                <Label className={"cursor-pointer"}
                                                       htmlFor={`genre-${genre}`}>{genre}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </form>
                            </ScrollArea>
                            <SheetFooter>
                                <div className="flex justify-between w-full">
                                    <Button variant="destructive" onClick={clearFilters}>
                                        Очистить фильтры
                                    </Button>
                                    <Button onClick={applyFilters}>Применить фильтры</Button>
                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    <Select onValueChange={(value) => dispatch({type: 'SET_SORT', payload: value})} value={sort}>
                        <SelectTrigger
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-[180px]">
                            <SelectValue placeholder="Сортировка"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Сортировать по</SelectLabel>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Карточки книг */}
            <section className="pb-16 pt-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {books.length > 0 ? (
                        books.map((book) => <BookCard key={book.id} book={book}/>)
                    ) : (
                        <div className="text-gray-600 text-center col-span-full">Книги не найдены</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BooksCatalogPage;
