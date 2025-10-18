import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import FavoriteBookItem from '@/components/FavoriteBookItem';
import { useFavorites } from '@/api/FavoritesContext';

const FavoritesSidebar = ({ isOpen, onClose }) => {
    const { favoriteIds } = useFavorites();

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Избранное</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                    <div className="py-4 space-y-4">
                        {favoriteIds.length > 0 ? (
                            favoriteIds.map((bookId) => (
                                <FavoriteBookItem key={bookId} bookId={bookId} onClose={onClose} />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-8">
                                <p>В избранном пока пусто</p>
                                <p className="text-sm">Добавляйте книги, нажимая на сердечко</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default FavoritesSidebar;
