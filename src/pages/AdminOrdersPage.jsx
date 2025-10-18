import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableRow, TableCell, TableHead, TableHeader, TableBody } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [bookTitles, setBookTitles] = useState({});
    const [bookFilter, setBookFilter] = useState('');
    const [statuses] = useState(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REJECTED', 'RETURNED', 'FAILED']);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [sorting, setSorting] = useState([]);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get('/manager/orders');
            setOrders(response.data);

            const userIds = [...new Set(response.data.map(order => order.userId))];
            const bookIds = response.data.flatMap(order => order.orderDetailsDTO.map(detail => detail.bookId));
            await fetchBookTitles([...new Set(bookIds)]);
            await fetchUsers(userIds);
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
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

    const fetchUsers = async (userIds) => {
        try {
            const usersData = {};
            for (const userId of userIds) {
                const response = await axiosInstance.get(`/general/user/${userId}`);
                usersData[userId] = response.data;
            }
            setUsers(usersData);
        } catch (error) {
            console.error('Ошибка при получении пользователей:', error);
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
                accessorKey: 'userId',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        ID пользователя <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="link">{row.getValue('userId')}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            {users[row.getValue('userId')] ? (
                                <div className="space-y-2">
                                    <p>
                                        <strong>Email:</strong> {users[row.getValue('userId')].email}
                                    </p>
                                    <p>
                                        <strong>Номер телефона:</strong> {users[row.getValue('userId')].phoneNumber}
                                    </p>
                                    <p>
                                        <strong>Имя:</strong> {users[row.getValue('userId')].name}
                                    </p>
                                    <p>
                                        <strong>Фамилия:</strong> {users[row.getValue('userId')].surname}
                                    </p>
                                </div>
                            ) : (
                                <p>Загрузка данных пользователя...</p>
                            )}
                        </PopoverContent>
                    </Popover>
                ),
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

                    const dateTimeA = dateA && Array.isArray(timeA) && timeA.length === 2
                        ? new Date(dateA).setHours(timeA[0], timeA[1])
                        : null;
                    const dateTimeB = dateB && Array.isArray(timeB) && timeB.length === 2
                        ? new Date(dateB).setHours(timeB[0], timeB[1])
                        : null;

                    if (dateTimeA == null) return 1;
                    if (dateTimeB == null) return -1;

                    return dateTimeA - dateTimeB;
                },
            },
            {
                accessorKey: 'deliveryDateTime',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        className="px-0"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Время доставки <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row }) => {
                    const { deliveryDate, deliveryTime } = row.original;

                    if (deliveryDate && Array.isArray(deliveryTime) && deliveryTime.length === 2) {
                        const [hours, minutes] = deliveryTime;
                        const combinedDateTime = new Date(deliveryDate);

                        if (!isNaN(combinedDateTime) && typeof hours === 'number' && typeof minutes === 'number') {
                            combinedDateTime.setHours(hours);
                            combinedDateTime.setMinutes(minutes);
                            return format(combinedDateTime, 'dd.MM.yyyy HH:mm', { locale: ru });
                        }
                    }
                    return 'Не указано';
                },
                sortingFn: (rowA, rowB) => {
                    const { deliveryDate: dateA, deliveryTime: timeA } = rowA.original;
                    const { deliveryDate: dateB, deliveryTime: timeB } = rowB.original;

                    const dateTimeA = dateA && Array.isArray(timeA) && timeA.length === 2
                        ? new Date(dateA).setHours(timeA[0], timeA[1])
                        : null;
                    const dateTimeB = dateB && Array.isArray(timeB) && timeB.length === 2
                        ? new Date(dateB).setHours(timeB[0], timeB[1])
                        : null;

                    if (dateTimeA == null) return 1;
                    if (dateTimeB == null) return -1;

                    return dateTimeA - dateTimeB;
                },
            },
            {
                accessorKey: 'deliveryAddress',
                header: 'Адрес',
                cell: ({ row }) => <span>{row.getValue('deliveryAddress') || '-'}</span>,
            },
            {
                accessorKey: 'comment',
                header: 'Комментарий',
                cell: ({ row }) => <span>{row.getValue('comment') || '-'}</span>,
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
                    <Button size="sm" onClick={() => openDialogForEdit(row.original)}>
                        Изменить статус
                    </Button>
                ),
            },
        ],
        [users, bookTitles, navigate]
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
        getSortedRowModel: getSortedRowModel()
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const openDialogForEdit = (order) => {
        setEditingOrder(order);
        setNewStatus(order.status);
        setIsDialogOpen(true);
    };

    const handleEditOrder = async () => {
        try {
            const updatedOrder = { ...editingOrder, status: newStatus };
            await axiosInstance.put(`/manager/orders/${editingOrder.id}`, updatedOrder);
            setIsDialogOpen(false);
            fetchOrders();
        } catch (error) {
            console.log('Ошибка при обновлении статуса заказа');
        }
        toast({
            title: 'Статус обновлён',
            description: 'Статус заказа успешно изменён.',
            variant: 'success',
            className: 'bg-black text-white',
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
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
                        <DialogTitle>Изменить статус заказа</DialogTitle>
                    </DialogHeader>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleEditOrder}>Сохранить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrdersPage;
