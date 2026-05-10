import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, BookOpen, Calendar, Building, Globe, Star, FileText, Scale, Ruler, ShieldAlert, Barcode, Languages } from "lucide-react";
import { BookActions } from "@/components/book-actions";
import { FavoriteButton } from "@/components/favorite-button";
import { ManagerEditButton } from "@/components/manager-edit-button";
import { BookGallery } from "@/components/book-gallery";
import { BookReviews } from "@/components/book-reviews";
import { cn, formatBookFormat, formatAgeRating, formatLanguage, capitalize } from "@/lib/utils";


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
  pagesCount?: number;
  isbn?: string;
  language?: string;
  originalLanguage?: string;
  format?: string;
  weight?: number;
  dimensions?: string;
  ageRating?: string;
  genres?: string[];
  stockQuantity?: number;
}

async function getBookDetail(id: string): Promise<BookDetail | null> {
  const res = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8080"}/api/catalog/books/${id}`, {
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
                {book.pagesCount && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Кол-во страниц</span>
                      <span className="font-medium text-sm">{book.pagesCount}</span>
                    </div>
                  </div>
                )}
                {book.format && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Формат</span>
                      <span className="font-medium text-sm">{capitalize(formatBookFormat(book.format))}</span>
                    </div>
                  </div>
                )}
                {book.language && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Язык</span>
                      <span className="font-medium text-sm">{capitalize(formatLanguage(book.language))}</span>
                    </div>
                  </div>
                )}
                {book.originalLanguage && (
                  <div className="flex items-start gap-3">
                    <Languages className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Язык оригинала</span>
                      <span className="font-medium text-sm">{capitalize(formatLanguage(book.originalLanguage))}</span>
                    </div>
                  </div>
                )}
                {book.weight && (
                  <div className="flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Вес</span>
                      <span className="font-medium text-sm">{book.weight} г</span>
                    </div>
                  </div>
                )}
                {book.dimensions && (
                  <div className="flex items-start gap-3">
                    <Ruler className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Размеры</span>
                      <span className="font-medium text-sm">{book.dimensions}</span>
                    </div>
                  </div>
                )}
                {book.ageRating && (
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Возрастное ограничение</span>
                      <span className="font-medium text-sm">{formatAgeRating(book.ageRating)}</span>
                    </div>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-start gap-3">
                    <Barcode className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
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

        <BookReviews bookId={book.id} />
      </div>
    </div>
  );
}