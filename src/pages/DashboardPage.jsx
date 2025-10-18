import React, {useEffect, useMemo, useState} from 'react';
import {ru} from 'date-fns/locale';
import axiosInstance from '../api/axios';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Label,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Calendar} from '@/components/ui/calendar';

// Расширенный массив цветов для лучшей визуальности
const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c',
    '#ff6f61', '#6b5b95', '#feb236', '#d64161', '#ff7f50', '#6495ed'
];

const generateTooltip = (labelPrefix, valueLabel) => {
    return ({active, payload, label}) => {
        if (active && payload && payload.length) {
            // Для PieChart используем payload[0].name, если label не определен
            const displayLabel = label || payload[0].name;
            return (
                <div className="bg-white p-2 border rounded shadow">
                    <p className="text-l font-medium">{`${labelPrefix}: ${displayLabel || 'Неизвестно'}`}</p>
                    <p className="text-m text-blue-600">
                        {`${valueLabel}: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };
};

const DashboardPage = () => {
    const [ordersByMonth, setOrdersByMonth] = useState([]);
    const [ordersByStatus, setOrdersByStatus] = useState([]);
    const [booksPerGenre, setBooksPerGenre] = useState([]);
    const [bookRatings, setBookRatings] = useState([]);
    const [bookPopularity, setBookPopularity] = useState([]);
    const [bookReviews, setBookReviews] = useState([]);
    const [genreRatings, setGenreRatings] = useState([]);
    const [publisherBookCounts, setPublisherBookCounts] = useState([]);
    const [authorBookCounts, setAuthorBookCounts] = useState([]);
    const [genrePopularity, setGenrePopularity] = useState([]);
    const [authorPopularity, setAuthorPopularity] = useState([]);

    const [dateRange, setDateRange] = useState({from: null, to: null});

    useEffect(() => {
        console.log('useEffect triggered with dateRange:', dateRange);
        const params = new URLSearchParams();
        if (dateRange.from) params.append('from', dateRange.from.toLocaleDateString('sv-SE'));
        if (dateRange.to) params.append('to', dateRange.to.toLocaleDateString('sv-SE'));

        axiosInstance.get(`/stats/orders-by-month?${params}`).then(res => setOrdersByMonth(res.data));
        axiosInstance.get(`/stats/book-popularity?${params}`).then(res => setBookPopularity(res.data));
        axiosInstance.get(`/stats/book-review-counts?${params}`).then(res => setBookReviews(res.data));
        axiosInstance.get(`/stats/genre-popularity?${params}`).then(res => setGenrePopularity(res.data));
        axiosInstance.get(`/stats/author-popularity?${params}`).then(res => setAuthorPopularity(res.data));
        axiosInstance.get(`/stats/orders-by-status?${params}`).then(res => setOrdersByStatus(res.data));
    }, [dateRange]);

    useEffect(() => {
        axiosInstance.get('/stats/books-per-genre').then(res => setBooksPerGenre(res.data));
        axiosInstance.get('/stats/book-ratings').then(res => setBookRatings(res.data));
        axiosInstance.get('/stats/genre-ratings').then(res => setGenreRatings(res.data));
        axiosInstance.get('/stats/publisher-book-counts').then(res => setPublisherBookCounts(res.data));
        axiosInstance.get('/stats/author-book-counts').then(res => setAuthorBookCounts(res.data));
    }, []);

    const totalBooks = useMemo(() =>
        booksPerGenre.reduce((acc, curr) => acc + curr.bookCount, 0), [booksPerGenre]);

    const totalOrdersByStatus = useMemo(() =>
        ordersByStatus.reduce((acc, curr) => acc + curr.count, 0), [ordersByStatus]);

    const chartGroups = [
        {
            groupTitle: 'Статистика заказов',
            charts: [
                {
                    title: 'Заказы по месяцам',
                    description: 'Количество заказов в каждом месяце',
                    chart: (
                        <BarChart data={ordersByMonth} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="month"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Месяц', 'Кол-во заказов')}/>
                            <Bar
                                dataKey="totalOrders"
                                fill="#8884d8"
                            />
                        </BarChart>
                    )
                },
                {
                    title: 'Заказы по статусам',
                    description: 'Количество заказов по каждому статусу',
                    chart: (
                        <PieChart>
                            <Tooltip content={generateTooltip('Статус', 'Кол-во заказов')}/>
                            <Pie
                                data={ordersByStatus}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={60}
                                outerRadius={100}
                                strokeWidth={5}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.href = '/admin/orders';
                                }}
                            >
                                <Label
                                    content={({viewBox}) => {
                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle"
                                                      dominantBaseline="middle">
                                                    <tspan x={viewBox.cx} y={viewBox.cy}
                                                           className="fill-foreground text-3xl font-bold">
                                                        {totalOrdersByStatus.toLocaleString()}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24}
                                                           className="fill-muted-foreground">
                                                        Всего заказов
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                                {ordersByStatus.map((entry, index) => (
                                    <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                        </PieChart>
                    )
                },
                {
                    title: 'Популярность книг',
                    description: 'Количество заказов на каждую книгу',
                    chart: (
                        <BarChart data={bookPopularity} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="bookTitle"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Книга', 'Кол-во заказов')}/>
                            <Bar
                                dataKey="orderCount"
                                fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
                                cursor={"pointer"}
                                onClick={async (data) => {
                                    if (data && data.bookTitle) {
                                        try {
                                            const response = await axiosInstance.get(`/general/books/title/${encodeURIComponent(data.bookTitle)}`);
                                            const bookId = response.data;
                                            window.location.href = `http://localhost:5173/book/${bookId}`;
                                        } catch (error) {
                                            console.error('Ошибка при получении ID книги:', error);
                                        }
                                    }
                                }}
                            />
                        </BarChart>
                    )
                },
                {
                    title: 'Популярность жанров',
                    description: 'Количество заказов книг в каждом жанре',
                    chart: (
                        <BarChart data={genrePopularity} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="genreName"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Жанр', 'Кол-во заказов')}/>
                            <Bar
                                dataKey="orderCount"
                                fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.href = '/admin/genres';
                                }}
                            />
                        </BarChart>
                    )
                },
                {
                    title: 'Популярность авторов',
                    description: 'Общее количество заказов книг каждого автора',
                    chart: (
                        <BarChart data={authorPopularity} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="author"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Автор', 'Кол-во заказов')}/>
                            <Bar dataKey="orderCount" fill={COLORS[Math.floor(Math.random() * COLORS.length)]}/>
                        </BarChart>
                    )
                }
            ]
        },
        {
            groupTitle: 'Рейтинги и отзывы',
            charts: [
                {
                    title: 'Средняя оценка книг',
                    description: 'Средние значения оценок на основе отзывов',
                    chart: (
                        <BarChart data={bookRatings} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="bookTitle"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis domain={[0, 5]}/>
                            <Tooltip content={generateTooltip('Книга', 'Средняя оценка')}/>
                            <Bar
                                dataKey="averageRating"
                                fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
                                cursor={"pointer"}
                                onClick={async (data) => {
                                    if (data && data.bookTitle) {
                                        try {
                                            const response = await axiosInstance.get(`/general/books/title/${encodeURIComponent(data.bookTitle)}`);
                                            const bookId = response.data;
                                            window.location.href = `http://localhost:5173/book/${bookId}`;
                                        } catch (error) {
                                            console.error('Ошибка при получении ID книги:', error);
                                        }
                                    }
                                }}
                            />
                        </BarChart>
                    )
                },
                {
                    title: 'Рейтинг по жанрам',
                    description: 'Средний рейтинг книг в каждом жанре',
                    chart: (
                        <BarChart data={genreRatings} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="genreName"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis domain={[0, 5]}/>
                            <Tooltip content={generateTooltip('Жанр', 'Средняя оценка')}/>
                            <Bar
                                dataKey="averageRating"
                                fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.href = '/admin/genres';
                                }}
                            />
                        </BarChart>
                    )
                },
                {
                    title: 'Отзывы на книги',
                    description: 'Количество отзывов по каждой книге',
                    chart: (
                        <BarChart data={bookReviews} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="bookTitle"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Книга', 'Кол-во отзывов')}/>
                            <Bar
                                dataKey="reviewCount"
                                fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
                                cursor={"pointer"}
                                onClick={async (data) => {
                                    if (data && data.bookTitle) {
                                        try {
                                            const response = await axiosInstance.get(`/general/books/title/${encodeURIComponent(data.bookTitle)}`);
                                            const bookId = response.data;
                                            window.location.href = `http://localhost:5173/book/${bookId}`;
                                        } catch (error) {
                                            console.error('Ошибка при получении ID книги:', error);
                                        }
                                    }
                                }}
                            />
                        </BarChart>
                    )
                }
            ]
        },
        {
            groupTitle: 'Книги, жанры, авторы и издательства',
            charts: [
                {
                    title: 'Распределение книг по жанрам',
                    description: 'Количество книг в каждом жанре',
                    chart: (
                        <PieChart>
                            <Tooltip content={generateTooltip('Жанр', 'Кол-во книг')}/>
                            <Pie
                                data={booksPerGenre}
                                dataKey="bookCount"
                                nameKey="genreName"
                                innerRadius={60}
                                outerRadius={100}
                                strokeWidth={5}
                                cursor={"pointer"}
                                onClick={() => {
                                    window.location.href = '/admin/genres';
                                }}
                            >
                                <Label
                                    content={({viewBox}) => {
                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle"
                                                      dominantBaseline="middle">
                                                    <tspan x={viewBox.cx} y={viewBox.cy}
                                                           className="fill-foreground text-3xl font-bold">
                                                        {totalBooks.toLocaleString()}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24}
                                                           className="fill-muted-foreground">
                                                        Всего книг
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                                {booksPerGenre.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                        </PieChart>
                    )
                },
                {
                    title: 'Книги по авторам',
                    description: 'Количество книг у каждого автора',
                    chart: (
                        <BarChart data={authorBookCounts} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="author"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Автор', 'Кол-во книг')}/>
                            <Bar dataKey="bookCount" fill={COLORS[Math.floor(Math.random() * COLORS.length)]}/>
                        </BarChart>
                    )
                },
                {
                    title: 'Книги по издателям',
                    description: 'Количество книг по издательствам',
                    chart: (
                        <BarChart data={publisherBookCounts} margin={{top: 10, right: 16, left: 16, bottom: 80}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                dataKey="publisher"
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis/>
                            <Tooltip content={generateTooltip('Издатель', 'Кол-во книг')}/>
                            <Bar dataKey="bookCount" fill={COLORS[Math.floor(Math.random() * COLORS.length)]}/>
                        </BarChart>
                    )
                }
            ]
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Панель аналитики</h1>

            <div className="mb-6">
                <p className="mb-2 text-sm text-muted-foreground">Выберите диапазон дат</p>
                <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                        console.log('Selected range:', range);
                        if (range) {
                            setDateRange({
                                from: range.from,
                                to: range.to || range.from
                            });
                        } else {
                            setDateRange({from: null, to: null});
                        }
                    }}
                    locale={ru}
                    disabled={(date) => date > new Date()}
                    initialFocus
                />
            </div>

            {chartGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">{group.groupTitle}</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {group.charts.map((card, index) => (
                            <Card key={index} className="flex flex-col w-full">
                                <CardHeader className="pb-2">
                                    <CardTitle>{card.title}</CardTitle>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ResponsiveContainer width="100%" height={400}>
                                        {card.chart}
                                    </ResponsiveContainer>
                                </CardContent>
                                <CardFooter className="text-sm text-muted-foreground">
                                    Актуальные данные за период
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardPage;