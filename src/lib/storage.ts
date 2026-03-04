import type { Order } from "./types";

const STORAGE_KEY = "delivery-orders";

export const getOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOrders = (orders: Order[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const addOrder = (order: Order): Order[] => {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  return orders;
};

export const deleteOrder = (id: string): Order[] => {
  const orders = getOrders().filter((o) => o.id !== id);
  saveOrders(orders);
  return orders;
};

export const getOrderById = (id: string): Order | undefined =>
  getOrders().find((o) => o.id === id);
