import { Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-emerald-600">404</h1>
          <h2 className="text-2xl font-semibold">Страница не найдена</h2>
        </div>

        <p className="text-muted-foreground">
          Запрашиваемая страница не существует. Возможно, она была удалена или
          вы ввели неверный адрес.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Home size={16} className="mr-2" />
              На главную
            </Button>
          </Link>
          <Link href="/app">
            <Button variant="outline">
              <BookOpen size={16} className="mr-2" />
              К тренажёру
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
