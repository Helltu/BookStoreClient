'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, User, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { reviewsApi } from '@/lib/api/reviews';
import { useAuthStore } from '@/store/useAuthStore';
import type { Review, ReviewSortKey } from '@/lib/types/reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE = 20;

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-6 w-6 transition-colors',
            onChange ? 'cursor-pointer' : '',
            (hovered || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          )}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function sortReviews(reviews: Review[], key: ReviewSortKey): Review[] {
  const copy = [...reviews];
  switch (key) {
    case 'newest': return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'oldest': return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'highest': return copy.sort((a, b) => b.rating - a.rating);
    case 'lowest': return copy.sort((a, b) => a.rating - b.rating);
  }
}

export function BookReviews({ bookId }: { bookId: string }) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [sort, setSort] = useState<ReviewSortKey>('newest');
  const [page, setPage] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await reviewsApi.getByBook(bookId);
      setReviews(res.data);
    } catch {
      // error toast shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    reviewsApi.canReview(bookId)
      .then((res) => setCanReview(res.data))
      .catch(() => setCanReview(false));
  }, [bookId, isAuthenticated, authLoading]);

  const sorted = useMemo(() => sortReviews(reviews, sort), [reviews, sort]);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSortChange = (val: ReviewSortKey) => {
    setSort(val);
    setPage(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Выберите рейтинг'); return; }
    if (!text.trim()) { toast.error('Текст отзыва не может быть пустым'); return; }
    setSubmitting(true);
    try {
      await reviewsApi.create(bookId, rating, text.trim());
      toast.success('Отзыв добавлен');
      setDialogOpen(false);
      setRating(0);
      setText('');
      setCanReview(false);
      await fetchReviews();
    } catch {
      // interceptor shows error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reviewsApi.delete(id);
      toast.success('Отзыв удалён');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // interceptor shows error
    }
  };

  const isManager = user?.role === 'MANAGER';

  return (
    <div className="mt-12 pt-10 border-t">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Отзывы читателей</h2>
          <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
            {reviews.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {reviews.length > 1 && (
            <Select value={sort} onValueChange={(v) => handleSortChange(v as ReviewSortKey)}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Сначала новые</SelectItem>
                <SelectItem value="oldest">Сначала старые</SelectItem>
                <SelectItem value="highest">По убыванию оценки</SelectItem>
                <SelectItem value="lowest">По возрастанию оценки</SelectItem>
              </SelectContent>
            </Select>
          )}
          {canReview && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Написать отзыв
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted/20 border rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-muted/20 border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет отзывов</h3>
          <p className="text-muted-foreground max-w-sm">
            На эту книгу пока никто не оставил отзыв. Станьте первым, кто поделится своими впечатлениями!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {paginated.map((review) => (
              <div key={review.id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {review.author.firstName
                          ? `${review.author.firstName}${review.author.lastName ? ' ' + review.author.lastName : ''}`
                          : review.author.username}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  {isManager && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex mb-3 gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn('h-4 w-4', review.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Написать отзыв</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Оценка</span>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Отзыв</span>
              <Textarea
                placeholder="Поделитесь впечатлениями о книге..."
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Отмена
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
