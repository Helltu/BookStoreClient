import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ChevronRight, BookOpen, Hash, Calendar, Building, Globe, User } from "lucide-react";
import { BookActions } from "@/components/book-actions";
import { FavoriteButton } from "@/components/favorite-button";
import { ManagerEditButton } from "@/components/manager-edit-button";
import { BookGallery } from "@/components/book-gallery";
import { cn } from "@/lib/utils";

// Расширенный интерфейс для детальной информации о книге
interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface BookDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  authors: string[];
  coverUrl?: string;
  previewUrls?: string[];
  averageRating?: number;
  totalReviews?: number;
  publisher?: string;
  publicationYear?: number;
  pageCount?: number;
  isbn?: string;
  language?: string;
  reviews?: Review[];
  genres?: string[];
  stockQuantity?: number;
}

async function getBookDetail(id: string): Promise<BookDetail | null> {
  const res = await fetch(`http://localhost:8080/api/catalog/books/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function BookPage(props: { params: Promise<{ id: string }> }) {
  // В Next.js 15 params является Promise
  const params = await props.params;
  const book = await getBookDetail(params.id);

  if (!book) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 bg-background">
      <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-6 sm:gap-10">
        <ManagerEditButton type="book" id={book.id} className="absolute top-0 right-0" />

        {/* Хлебные крошки */}
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">Главная</Link>
          <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
          <Link href="/" className="hover:text-foreground transition-colors">Каталог</Link>
          <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
          <span className="text-foreground font-medium truncate" aria-current="page">{book.title}</span>
        </nav>

        {/* Верхняя часть: Обложка и основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">

          {/* Левая колонка: Обложка */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
            <BookGallery coverUrl={book.coverUrl} previewUrls={book.previewUrls} title={book.title} />
          </div>

          {/* Правая колонка: Детали */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {book.title}
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground flex flex-wrap gap-1">
                {book.authors && book.authors.length > 0
                  ? book.authors.map((author, idx) => (
                      <span key={idx}>
                        <Link href={`/author/${encodeURIComponent(author)}`} className="hover:text-foreground transition-colors">
                          {author}
                        </Link>
                        {idx < book.authors.length - 1 && ", "}
                      </span>
                    ))
                  : "Неизвестный автор"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        (book.averageRating || 0) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm ml-1">{book.averageRating?.toFixed(1) || "0.0"}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {book.totalReviews ? `${book.totalReviews} отзывов` : "Нет отзывов"}
              </span>
            </div>

            {/* Жанры */}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {book.genres.map((genre, idx) => (
                  <Link
                    key={idx}
                    href={`/genre/${encodeURIComponent(genre)}`}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            {/* Блок покупки */}
            <div className="py-6 border-y mb-8 flex flex-col gap-4">
              {/* Наличие */}
              {book.stockQuantity === 0 && (
                <span className="inline-flex w-fit items-center rounded-md bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive border border-destructive/30">
                  Нет в наличии
                </span>
              )}
              {book.stockQuantity !== undefined && book.stockQuantity > 0 && book.stockQuantity <= 5 && (
                <span className="inline-flex w-fit items-center rounded-md bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-600 border border-amber-500/30">
                  Осталось: {book.stockQuantity} шт.
                </span>
              )}
              {/* Цена */}
              <div className="flex items-baseline gap-2">
    <span className="text-4xl font-bold tracking-tight">
      {book.price.toFixed(2)}
    </span>
                <span className="text-xl text-muted-foreground font-medium">р.</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <BookActions
                    bookId={book.id}
                    title={book.title}
                    price={book.price}
                    coverUrl={book.coverUrl}
                    authors={book.authors}
                    averageRating={book.averageRating}
                    totalReviews={book.totalReviews}
                    stockQuantity={book.stockQuantity}
                />
                <FavoriteButton
                    className="w-full sm:w-auto"
                    book={{
                      id: book.id,
                      title: book.title,
                      price: book.price,
                      coverUrl: book.coverUrl
                    }}
                />
              </div>
            </div>

            {/* Описание */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                О книге
              </h3>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {book.description ? (
                  <p>{book.description}</p>
                ) : (
                  <p className="italic opacity-80">Описание отсутствует.</p>
                )}
              </div>
            </div>

            {/* Характеристики (Metadata) */}
            <div className="bg-muted/30 border rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-5">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {book.publisher && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Издательство</span>
                      <Link href={`/publisher/${encodeURIComponent(book.publisher)}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {book.publisher}
                      </Link>
                    </div>
                  </div>
                )}
                {book.publicationYear && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Год издания</span>
                      <span className="font-medium text-sm">{book.publicationYear}</span>
                    </div>
                  </div>
                )}
                {book.pageCount && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Кол-во страниц</span>
                      <span className="font-medium text-sm">{book.pageCount}</span>
                    </div>
                  </div>
                )}
                {book.language && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Язык</span>
                      <span className="font-medium text-sm">{book.language}</span>
                    </div>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">ISBN</span>
                      <span className="font-medium text-sm">{book.isbn}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Секция отзывов */}
        <div className="mt-12 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Отзывы читателей</h2>
            <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
              {book.reviews?.length || 0}
            </span>
          </div>

          {(!book.reviews || book.reviews.length === 0) ? (
            <div className="bg-muted/20 border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет отзывов</h3>
              <p className="text-muted-foreground max-w-sm">На эту книгу пока никто не оставил отзыв. Станьте первым, кто поделится своими впечатлениями!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {book.reviews.map((review) => (
                <div key={review.id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex mb-3 gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn("h-4 w-4", review.rating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}