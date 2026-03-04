import Link from "next/link";
import { DeliveryForm } from "@/components/DeliveryForm";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:items-center sm:gap-0">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Доставка посылки
          </h1>
          <Link
            href="/orders"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            История заявок
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <DeliveryForm />
      </main>
    </div>
  );
}
