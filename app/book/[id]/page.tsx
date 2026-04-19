import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ChevronRight, BookOpen, Hash, Calendar, Building, Globe, User } from "lucide-react";
import { BookActions } from "@/components/book-actions";
import { Separator } from "@/components/ui/separator";
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
  averageRating?: number;
  totalReviews?: number;
  publisher?: string;
  publicationYear?: number;
  pageCount?: number;
  isbn?: string;
  language?: string;
  reviews?: Review[];
  genres?: string[];
}

async function getBookDetail(id: string): Promise<BookDetail | null> {
  const res = await fetch(`http://localhost:8080/api/catalog/books/${id}`, {
    next: { revalidate: 60 },
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch book");
  }
  
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
    <div className="flex flex-col flex-1 p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Хлебные крошки */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/" className="hover:text-foreground transition-colors">Каталог</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{book.title}</span>
        </nav>

        {/* Верхняя часть: Обложка и основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Левая колонка: Обложка */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="aspect-[2/3] w-full overflow-hidden rounded-xl border bg-muted shadow-lg">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Нет обложки
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка: Детали */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {book.authors?.join(", ") || "Неизвестный автор"}
            </p>
            
            {/* Жанры */}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {book.genres.map((genre, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      "h-5 w-5", 
                      (book.averageRating || 0) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                    )} 
                  />
                ))}
              </div>
              <span className="font-medium ml-1">{book.averageRating?.toFixed(1) || "0.0"}</span>
              <span className="text-muted-foreground ml-2">({book.totalReviews || 0} отзывов)</span>
            </div>

            <Separator className="mb-6" />

            {/* Клиентский компонент кнопок */}
            <BookActions 
              bookId={book.id} 
              title={book.title} 
              price={book.price} 
              coverUrl={book.coverUrl} 
            />

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">О книге</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description || "Описание отсутствует."}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {book.publisher && (
                <div className="flex items-center gap-3 text-sm"><Building className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground w-32">Издательство:</span><span className="font-medium">{book.publisher}</span></div>
              )}
              {book.publicationYear && (
                <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground w-32">Год издания:</span><span className="font-medium">{book.publicationYear}</span></div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-3 text-sm"><BookOpen className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground w-32">Кол-во страниц:</span><span className="font-medium">{book.pageCount}</span></div>
              )}
              {book.language && (
                <div className="flex items-center gap-3 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground w-32">Язык:</span><span className="font-medium">{book.language}</span></div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-3 text-sm"><Hash className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground w-32">ISBN:</span><span className="font-medium">{book.isbn}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Секция отзывов */}
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Отзывы читателей</h2>
          
          {(!book.reviews || book.reviews.length === 0) ? (
            <p className="text-muted-foreground">На эту книгу пока нет отзывов. Станьте первым!</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {book.reviews.map((review) => (
                <div key={review.id} className="bg-card border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground"><User className="h-4 w-4" /></div>
                      <span className="font-medium">{review.userName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn("h-4 w-4", review.rating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}