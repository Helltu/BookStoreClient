import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ApiSearchDialog from './ApiSearchDialog';

const AddBookDialog = ({ isOpen, onOpenChange }) => {
    const navigate = useNavigate();
    const [isApiSearchOpen, setIsApiSearchOpen] = useState(false);

    const handleManualAdd = () => {
        navigate('/admin/add-book');
        onOpenChange(false);
    };

    const handleApiAdd = () => {
        onOpenChange(false);
        setIsApiSearchOpen(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить новую книгу</DialogTitle>
                        <DialogDescription>
                            Выберите способ добавления книги в каталог.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button onClick={handleManualAdd}>Вручную</Button>
                        <Button onClick={handleApiAdd}>Через API</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <ApiSearchDialog isOpen={isApiSearchOpen} onOpenChange={setIsApiSearchOpen} />
        </>
    );
};

export default AddBookDialog;

