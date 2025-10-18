import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableRow, TableCell, TableHead, TableHeader, TableBody } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const UserOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [bookTitles, setBookTitles] = useState({});
    const [bookFilter, setBookFilter] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [sorting, setSorting] = useState([]);
    const { toast } = useToast();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const fetchOrders = async () => {
        if (!userId) {
            navigate('/login');
            return;
        }
        try {
            const response = await axiosInstance.get(`/client/${userId}/orders`);
            setOrders(response.data);

            const bookIds = response.data.flatMap(order => order.orderDetailsDTO.map(detail => detail.bookId));
            await fetchBookTitles([...new Set(bookIds)]);
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить заказы.',
                variant: 'destructive',
            });
        }
    };

    const fetchBookTitles = async (bookIds) => {
        try {
            const titles = {};
            for (const id of bookIds) {
                const response = await axiosInstance.get(`/general/books/${id}`);
                titles[id] = response.data.title;
            }
            setBookTitles(titles);
        } catch (error) {
            console.error('Ошибка при получении названий книг:', error);
        }
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        ID <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row }) => <span>{row.getValue('id')}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Статус',
                cell: ({ row }) => <span>{row.getValue('status')}</span>,
            },
            {
                accessorKey: 'orderDateTime',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Время заказа <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row }) => {
                    const { orderDate, orderTime } = row.original;

                    if (orderDate && Array.isArray(orderTime) && orderTime.length === 3) {
                        const [hours, minutes] = orderTime;
                        const combinedDateTime = new Date(orderDate);

                        if (!isNaN(combinedDateTime) && typeof hours === 'number' && typeof minutes === 'number') {
                            combinedDateTime.setHours(hours);
                            combinedDateTime.setMinutes(minutes);
                            return format(combinedDateTime, 'dd.MM.yyyy HH:mm', { locale: ru });
                        }
                    }
                    return 'Не указано';
                },
                sortingFn: (rowA, rowB) => {
                    const { orderDate: dateA, orderTime: timeA } = rowA.original;
                    const { orderDate: dateB, orderTime: timeB } = rowB.original;

                    const dateTimeA = dateA && Array.isArray(timeA) && timeA.length === 3
                        ? new Date(dateA).setHours(timeA[0], timeA[1])
                        : null;
                    const dateTimeB = dateB && Array.isArray(timeB) && timeB.length === 3
                        ? new Date(dateB).setHours(timeB[0], timeB[1])
                        : null;

                    if (dateTimeA == null) return 1;
                    if (dateTimeB == null) return -1;

                    return dateTimeA - dateTimeB;
                },
            },
            {
                accessorKey: 'books',
                header: 'Книги',
                cell: ({ row }) => (
                    <div>
                        {row.original.orderDetailsDTO.map((detail, index) => (
                            <Button
                                key={index}
                                variant="link"
                                onClick={() => navigate(`/book/${detail.bookId}`)}
                            >
                                {`${bookTitles[detail.bookId] || 'Загрузка...'} (${detail.amt} шт.)`}
                            </Button>
                        ))}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Действия',
                cell: ({ row }) => (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDialogForCancel(row.original)}
                        disabled={row.original.status !== 'PENDING'}
                    >
                        Отменить заказ
                    </Button>
                ),
            },
        ],
        [bookTitles, navigate]
    );

    const filteredOrders = useMemo(() => {
        if (!bookFilter) return orders;

        return orders.filter((order) =>
            order.orderDetailsDTO.some((detail) =>
                (bookTitles[detail.bookId] || '').toLowerCase().includes(bookFilter.toLowerCase())
            )
        );
    }, [orders, bookTitles, bookFilter]);

    const table = useReactTable({
        data: filteredOrders,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const openDialogForCancel = (order) => {
        if (order.status !== 'PENDING') {
            toast({
                title: 'Ошибка',
                description: 'Только заказы со статусом PENDING можно отменить.',
                variant: 'destructive',
            });
            return;
        }
        setEditingOrder(order);
        setIsDialogOpen(true);
    };

    const handleCancelOrder = async () => {
        try {
            await axiosInstance.put(`/client/orders/${editingOrder.id}/cancel`, null, {
                params: { userId }
            });
            setIsDialogOpen(false);
            fetchOrders();
            toast({
                title: 'Заказ отменён',
                description: 'Заказ был успешно отменён.',
                variant: 'success',
                className: 'bg-black text-white',
            });
        } catch (error) {
            console.error('Ошибка при отмене заказа:', error);
            toast({
                title: 'Ошибка',
                description: error.response?.data?.message || 'Не удалось отменить заказ.',
                variant: 'destructive',
            });
        }
    };

    if (!userId) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
            <Input
                placeholder="Фильтр по названию книг"
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="max-w-sm mb-4"
            />
            <div className="rounded-md border">
                <Table className="table-auto w-full">
                    <TableHeader className="bg-gray-100">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-2 py-1 text-center">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-2 py-1 text-center">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center">
                                    Заказы не найдены
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Отменить заказ</DialogTitle>
                    </DialogHeader>
                    <p>Вы уверены, что хотите отменить заказ #{editingOrder?.id}?</p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleCancelOrder}>Подтвердить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserOrdersPage;