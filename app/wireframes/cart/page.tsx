import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";

export default function CartWireframe() {
  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Корзина</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Список товаров */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm items-center">
              {/* Обложка */}
              <div className="w-20 h-28 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center border border-gray-300">
                <span className="text-xs text-gray-500">Обложка</span>
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <div className="text-lg font-semibold bg-gray-200 text-gray-800 px-1 rounded w-fit">Название книги</div>
                <div className="text-sm bg-gray-100 text-gray-600 px-1 rounded w-fit">Автор книги</div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 sm:mt-0 ml-auto flex-shrink-0">
                 {/* Контрол количества */}
                 <div className="flex items-center border border-gray-300 rounded">
                    <button className="p-2 text-gray-500 bg-gray-50"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center bg-gray-200 text-gray-800">1</span>
                    <button className="p-2 text-gray-500 bg-gray-50"><Plus className="h-4 w-4" /></button>
                 </div>
                 
                 {/* Цена */}
                 <div className="font-bold bg-gray-200 text-gray-800 px-1 rounded">1200 р.</div>
                 
                 {/* Удаление */}
                 <button className="p-2 text-red-500 hover:bg-red-50 rounded">
                   <Trash2 className="h-5 w-5" />
                 </button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-2">
            <button className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded hover:bg-gray-50">
              Очистить корзину
            </button>
          </div>
        </div>

        {/* Итог */}
        <div className="lg:col-span-4">
          <div className="border border-gray-200 rounded-xl bg-card p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Детали заказа</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары (3)</span>
                <span className="bg-gray-200 text-gray-800 px-1 rounded">3600.00 р.</span>
              </div>
            </div>
            
            <hr className="mb-4 border-gray-200" />
            
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg">Итого</span>
              <span className="font-bold text-2xl bg-gray-200 text-gray-800 px-2 rounded">3600.00 р.</span>
            </div>
            
            <button className="w-full h-12 bg-primary text-primary-foreground font-medium rounded opacity-80 flex items-center justify-center text-lg">
              К оформлению заказа
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}