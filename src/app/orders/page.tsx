"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getOrders, deleteOrder } from "@/lib/storage";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CARGO_LABELS } from "@/lib/constants";
import type { Order, CargoType } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  in_transit: "В пути",
  delivered: "Доставлено",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [cargoFilter, setCargoFilter] = useState<CargoType | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setOrders(getOrders());
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      o.recipientCity.toLowerCase().includes(search.toLowerCase());
    const matchCargo = cargoFilter === "all" || o.cargoType === cargoFilter;
    return matchSearch && matchCargo;
  });

  const handleConfirmDelete = useCallback(() => {
    if (deleteId) {
      deleteOrder(deleteId);
      setOrders(getOrders());
      setDeleteId(null);
    }
  }, [deleteId]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:items-center sm:gap-0">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            История заявок
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Оформить заявку
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Поиск по имени получателя и городу
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени получателя или городу назначения"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="cargoFilter" className="sr-only">
              Фильтр по типу груза
            </label>
            <select
              id="cargoFilter"
              value={cargoFilter}
              onChange={(e) =>
                setCargoFilter(e.target.value === "all" ? "all" : (e.target.value as CargoType))
              }
              className="select-arrow-inner w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 sm:w-40"
            >
              <option value="all">Все типы</option>
              <option value="documents">Документы</option>
              <option value="fragile">Хрупкое</option>
              <option value="regular">Обычное</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            {orders.length === 0
              ? "Заявок пока нет. Оформите первую!"
              : "Нет заявок по заданным критериям"}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/orders/${order.id}`}
                  className="flex-1 min-w-0"
                  tabIndex={0}
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {order.senderCity} → {order.recipientCity}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <span>{order.senderName}</span>
                    <span>{CARGO_LABELS[order.cargoType]}</span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span
                      className={`font-medium ${
                        order.status === "delivered"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : order.status === "in_transit"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteId(order.id);
                  }}
                  className="self-start rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 sm:self-center"
                  aria-label={`Удалить заявку ${order.senderCity} — ${order.recipientCity}`}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Удалить заявку?"
        message="Заявка будет удалена без возможности восстановления."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
