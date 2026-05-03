"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  Bell,
  BookOpen,
  Check,
  Heart,
  Info,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Trash2,
  X,
} from "lucide-react"

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function Swatch({ label, bg, varName }: { label: string; bg: string; varName: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className={`h-7 w-14 rounded-md ring-1 ring-foreground/10 ${bg}`} />
      <span className="text-[9px] leading-tight">{label}</span>
      <span className="text-[8px] text-muted-foreground font-mono leading-tight">{varName}</span>
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      {/* Header */}
      <div className="mb-5 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Система дизайна</h1>
        <span className="text-xs font-mono text-muted-foreground">/design-system · Book Store Client</span>
      </div>

      <div className="grid grid-cols-4 gap-4">

        {/* ── Column 1 ── */}
        <div className="space-y-4">

          <Card size="sm">
            <CardHeader><CardTitle>Основные цвета</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Swatch label="Background" bg="bg-background" varName="--background" />
                <Swatch label="Foreground" bg="bg-foreground" varName="--foreground" />
                <Swatch label="Card" bg="bg-card" varName="--card" />
                <Swatch label="Muted" bg="bg-muted" varName="--muted" />
                <Swatch label="Muted FG" bg="bg-muted-foreground" varName="--muted-fg" />
                <Swatch label="Border" bg="bg-border" varName="--border" />
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Акцентные цвета</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Swatch label="Primary" bg="bg-primary" varName="--primary" />
                <Swatch label="Primary FG" bg="bg-primary-foreground" varName="--primary-fg" />
                <Swatch label="Secondary" bg="bg-secondary" varName="--secondary" />
                <Swatch label="Secondary FG" bg="bg-secondary-foreground" varName="--secondary-fg" />
                <Swatch label="Accent" bg="bg-accent" varName="--accent" />
                <Swatch label="Destructive" bg="bg-destructive" varName="--destructive" />
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Цвета графиков</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {([
                  ["Revenue", "#6366f1"],
                  ["Genre 1", "#6366f1"],
                  ["Genre 2", "#8b5cf6"],
                  ["Genre 3", "#ec4899"],
                  ["Genre 4", "#f43f5e"],
                  ["Genre 5", "#f97316"],
                  ["Genre 6", "#eab308"],
                  ["Genre 7", "#22c55e"],
                  ["Genre 8", "#14b8a6"],
                  ["Genre 9", "#3b82f6"],
                  ["Genre 10", "#06b6d4"],
                  ["NEW", "#6366f1"],
                  ["PROC.", "#f59e0b"],
                  ["SHIP.", "#3b82f6"],
                  ["DELIV.", "#22c55e"],
                  ["RET.REQ", "#f97316"],
                  ["RETURN", "#ef4444"],
                ] as const).map(([label, color]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <div className="h-7 w-14 rounded-md ring-1 ring-foreground/10" style={{ backgroundColor: color }} />
                    <span className="text-[9px] leading-tight">{label}</span>
                    <span className="text-[8px] text-muted-foreground font-mono leading-tight">{color}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Скругления</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                {(["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"] as const).map((cls, i) => (
                  <div key={cls} className="flex flex-col items-center gap-1">
                    <div className={`bg-primary/20 ring-1 ring-primary/30 ${cls}`} style={{ width: 28, height: 28 }} />
                    <span className="text-[9px] text-muted-foreground">{["sm","md","lg","xl","2xl","full"][i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Column 2 ── */}
        <div className="space-y-4">

          <Card size="sm">
            <CardHeader><CardTitle>Типография</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {([
                ["text-3xl font-bold", "3xl bold"],
                ["text-2xl font-semibold", "2xl semibold"],
                ["text-xl font-semibold", "xl semibold"],
                ["text-lg font-medium", "lg medium"],
                ["text-base", "base regular"],
                ["text-sm text-muted-foreground", "sm muted"],
                ["text-xs text-muted-foreground", "xs muted"],
              ] as const).map(([cls, label]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">{label}</span>
                  <span className={cls}>Книжный магазин</span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex items-baseline gap-2">
                <span className="text-[9px] font-mono text-muted-foreground w-20 shrink-0">mono</span>
                <span className="font-mono text-xs">Цена</span>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Отступы</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-2">
                {[1,2,3,4,5,6,8,10,12,16].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-0.5">
                    <div className="bg-primary/20 ring-1 ring-primary/30 rounded-sm" style={{ width: s * 4, height: 16 }} />
                    <span className="text-[9px] text-muted-foreground font-mono">{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Иконки</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  [<BookOpen key="bo" />, "BookOpen"],
                  [<ShoppingCart key="sc" />, "Cart"],
                  [<Heart key="h" />, "Heart"],
                  [<Star key="st" />, "Star"],
                  [<Search key="se" />, "Search"],
                  [<Bell key="b" />, "Bell"],
                  [<Settings key="se2" />, "Settings"],
                  [<Trash2 key="t" />, "Trash2"],
                  [<Check key="c" />, "Check"],
                  [<X key="x" />, "X"],
                  [<Info key="i" />, "Info"],
                  [<AlertCircle key="ac" />, "Alert"],
                ].map(([icon, name]) => (
                  <div key={name as string} className="flex flex-col items-center gap-0.5 w-10">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">{icon}</div>
                    <span className="text-[8px] text-muted-foreground text-center leading-tight">{name as string}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Column 3 ── */}
        <div className="space-y-4">

          <Card size="sm">
            <CardHeader><CardTitle>Кнопки</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Block title="Варианты">
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="default">Default</Button>
                  <Button size="sm" variant="secondary">Secondary</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                  <Button size="sm" variant="ghost">Ghost</Button>
                  <Button size="sm" variant="destructive">Destructive</Button>
                  <Button size="sm" variant="link">Link</Button>
                </div>
              </Block>
              <Block title="Размеры">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button size="xs">xs</Button>
                  <Button size="sm">sm</Button>
                  <Button size="default">default</Button>
                  <Button size="lg">lg</Button>
                </div>
              </Block>
              <Block title="Иконки">
                <div className="flex flex-wrap gap-1.5">
                  <Button size="icon-xs" variant="outline"><Heart /></Button>
                  <Button size="icon-sm" variant="outline"><ShoppingCart /></Button>
                  <Button size="icon"><Search /></Button>
                  <Button size="icon-lg"><Bell /></Button>
                </div>
              </Block>
              <Block title="С иконками">
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm"><BookOpen />Читать</Button>
                  <Button size="sm" variant="outline"><ShoppingCart />Купить</Button>
                  <Button size="sm" variant="destructive"><Trash2 />Удалить</Button>
                </div>
              </Block>
              <Block title="Состояния">
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" disabled>Disabled</Button>
                  <Button size="sm" variant="outline" disabled>Disabled</Button>
                </div>
              </Block>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Варианты значков</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="ghost">Ghost</Badge>
                <Badge variant="link">Link</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default"><Star />Хит</Badge>
                <Badge variant="secondary"><BookOpen />В наличии</Badge>
                <Badge variant="destructive"><X />Нет</Badge>
                <Badge variant="outline"><Info />Новинка</Badge>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Column 4 ── */}
        <div className="space-y-4">

          <Card size="sm">
            <CardHeader><CardTitle>Элементы формы</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">По-умолчания</p>
                <Input placeholder="Введите текст..." />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">С иконкой</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Поиск..." />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">Выключенный</p>
                <Input placeholder="Недоступно" disabled />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">С ошибкой</p>
                <Input placeholder="Ошибка" aria-invalid="true" />
                <p className="text-[10px] text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />Обязательное поле
                </p>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Размеры карточек</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Card>
                <CardHeader><CardTitle>По-умолчанию</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Основной контент</p></CardContent>
              </Card>
              <Card size="sm">
                <CardHeader><CardTitle>Маленький</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Компактный вариант</p></CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader><CardTitle>Выделения</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  ["ring-1 ring-foreground/10", "/10"],
                  ["ring-1 ring-foreground/20", "/20"],
                  ["shadow-sm", "sm"],
                  ["shadow-md", "md"],
                  ["shadow-lg", "lg"],
                ].map(([cls, label]) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className={`h-10 w-14 rounded-lg bg-card ${cls} flex items-center justify-center`}>
                      <span className="text-[9px] text-muted-foreground font-mono">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
