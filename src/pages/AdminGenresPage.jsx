import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableRow, TableCell, TableHead, TableHeader, TableBody } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel} from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

const AdminGenresPage = () => {
    const [genres, setGenres] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [newGenreName, setNewGenreName] = useState('');
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const columns = [
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
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Название <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <span>{row.getValue('name')}</span>,
        },
        {
            id: 'actions',
            header: 'Действия',
            cell: ({ row }) => {
                const genre = row.original;
                return (
                    <div className="flex justify-center space-x-2">
                        <Button size="sm" onClick={() => openDialogForEdit(genre)}>
                            Редактировать
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteGenre(genre.id)}>
                            Удалить
                        </Button>
                    </div>
                );
            },
        },
    ];

    const [sorting, setSorting] = useState([]);
    const table = useReactTable({
        data: genres,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const fetchGenres = async () => {
        try {
            const response = await axiosInstance.get('/general/genres');
            setGenres(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке жанров:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGenre = async () => {
        try {
            const newGenre = { name: newGenreName };
            await axiosInstance.post('/manager/genres', newGenre);
        } catch (error) {
            console.log('Не удалось добавить жанр.');
            return;
        }
        toast({
            title: 'Жанр добавлен',
            description: 'Новый жанр успешно создан.',
            variant: 'success',
        });
        fetchGenres();
        setNewGenreName('');
        setIsDialogOpen(false);
    };

    const handleEditGenre = async () => {
        try {
            const updatedGenre = { ...editingGenre, name: newGenreName };
            await axiosInstance.put(`/manager/genres/${editingGenre.id}`, updatedGenre);
            toast({
                title: 'Жанр обновлён',
                description: 'Жанр успешно отредактирован.',
                variant: 'success',
            });
            fetchGenres();
            setEditingGenre(null);
            setNewGenreName('');
            setIsDialogOpen(false);
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось отредактировать жанр.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteGenre = async (id) => {
        try {
            await axiosInstance.delete(`/manager/genres/${id}`);
            toast({
                title: 'Жанр удалён',
                description: 'Жанр успешно удалён.',
                variant: 'success',
            });
            fetchGenres();
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить жанр.',
                variant: 'destructive',
            });
        }
    };

    const openDialogForAdd = () => {
        setEditingGenre(null);
        setNewGenreName('');
        setIsDialogOpen(true);
    };

    const openDialogForEdit = (genre) => {
        setEditingGenre(genre);
        setNewGenreName(genre.name);
        setIsDialogOpen(true);
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Управление жанрами</h1>
                <div className="text-gray-600 text-center">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Управление жанрами</h1>
                <Button onClick={openDialogForAdd}>Добавить жанр</Button>
            </div>
            <Input
                placeholder="Фильтр по названию жанра..."
                value={table.getColumn('name')?.getFilterValue() ?? ''}
                onChange={(event) =>
                    table.getColumn('name')?.setFilterValue(event.target.value)
                }
                className="max-w-sm mb-4"
            />
            <div className="rounded-md border">
                <Table className="table-auto w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-2 py-1 text-center"
                                    >
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
                                    Жанры не найдены.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGenre ? 'Редактировать жанр' : 'Добавить жанр'}</DialogTitle>
                    </DialogHeader>
                    <div className="my-4">
                        <Input
                            placeholder="Введите название жанра"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={editingGenre ? handleEditGenre : handleAddGenre}>
                            {editingGenre ? 'Сохранить' : 'Добавить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminGenresPage;
