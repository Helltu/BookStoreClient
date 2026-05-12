import Link from "next/link";

export default function AiConsultantWireframe() {
  return (
    <div className="flex flex-col flex-1 p-8 bg-gray-50 min-h-screen">
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto relative">
        <h1 className="text-2xl font-bold tracking-tight text-gray-700">Макет: Боковая панель ИИ-ассистента</h1>
        <p className="text-gray-500">
          Этот макет показывает открытую боковую панель чата поверх основного контента.
        </p>

        {/* Заглушка фона страницы */}
        <div className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
           Контент страницы (Каталог, Книга и т.д.)
        </div>

        {/* Открытая боковая панель ИИ */}
        <div className="absolute top-0 right-0 h-full w-[384px] bg-white border-l border-gray-300 shadow-2xl flex flex-col z-50">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 bg-gray-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-300 text-gray-600">
              {/* Иконка бота */}
              <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">ИИ Консультант</p>
              <p className="text-xs text-gray-500">Помогу с выбором книг</p>
            </div>
            <button className="rounded-md p-1 hover:bg-gray-200 text-gray-500 font-bold px-2">
              X
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
            
            {/* Сообщение от ассистента */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2 text-sm bg-gray-100 text-gray-800 border border-gray-200">
                Привет! Если хочешь подобрать книгу или узнать статус заказа — пиши, помогу
              </div>
            </div>

            {/* Сообщение от пользователя */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2 text-sm bg-gray-300 text-gray-900">
                Посоветуй хорошую фантастику
              </div>
            </div>

            {/* Сообщение от ассистента */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2 text-sm bg-gray-100 text-gray-800 border border-gray-200 flex flex-col gap-2">
                <p>Могу предложить несколько вариантов:</p>
                <ul className="list-disc pl-4 space-y-1">
                   <li>"Дюна" — Фрэнк Герберт</li>
                   <li>"Основание" — Айзек Азимов</li>
                </ul>
              </div>
            </div>

            {/* Индикатор набора текста */}
            <div className="flex justify-start">
              <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                </span>
              </div>
            </div>

          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 px-4 py-3 flex gap-2 bg-gray-50">
            <div className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 flex items-center">
              Напишите сообщение...
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-300 text-gray-600 self-end font-bold">
              {">"}
            </button>
          </div>

        </div>

        {/* Кнопка вызова (Floating button) */}
        <button className="absolute bottom-6 right-[400px] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 text-gray-700 shadow-lg border border-gray-400 font-bold">
          Чат
        </button>

      </main>
    </div>
  );
}