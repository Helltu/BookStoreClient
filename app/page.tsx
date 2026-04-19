export default function Home() {
  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Добро пожаловать в BookStore</h1>
        <p className="text-lg text-muted-foreground">Здесь будут отображаться карточки книг.</p>
      </main>
    </div>
  );
}
