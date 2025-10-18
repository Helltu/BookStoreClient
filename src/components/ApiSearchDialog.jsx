import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ApiSearchDialog = ({ isOpen, onOpenChange }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/admin/api-search-results?q=${query}`);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Поиск книги через API</DialogTitle>
                    <DialogDescription>
                        Введите ISBN или название книги для поиска.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="search-query" className="text-right">
                            Поиск
                        </Label>
                        <Input
                            id="search-query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="col-span-3"
                            placeholder="ISBN или название..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSearch}>Найти</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ApiSearchDialog;

