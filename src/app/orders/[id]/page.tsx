"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrderById } from "@/lib/storage";
import { CARGO_LABELS } from "@/lib/constants";
import type { Order } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  in_transit: "В пути",
  delivered: "Доставлено",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const o = getOrderById(id);
    setOrder(o ?? null);
  }, [id]);

  if (order === null) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link
              href="/orders"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              ← История заявок
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Заявка не найдена или ещё загружается.
          </p>
          <Link
            href="/orders"
            className="mt-4 inline-block text-emerald-600 hover:text-emerald-700"
          >
            К списку заявок
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/orders"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            ← История заявок
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Заявка #{order.id.slice(0, 8)}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                order.status === "delivered"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : order.status === "in_transit"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Отправитель
              </dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {order.senderName}
              </dd>
              <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                {order.senderPhone}
              </dd>
              <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                {order.senderCity}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Получатель
              </dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {order.recipientName}
              </dd>
              <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                {order.recipientCity}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Маршрут
              </dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {order.senderCity} → {order.recipientCity}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Посылка
              </dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {CARGO_LABELS[order.cargoType]}, {order.weight} кг
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Дата создания
              </dt>
              <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDate(order.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
