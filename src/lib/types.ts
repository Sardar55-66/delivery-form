export const CARGO_TYPES = ["documents", "fragile", "regular"] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const ORDER_STATUSES = ["pending", "in_transit", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderFormData {
  senderName: string;
  senderPhone: string;
  senderCity: string;
  recipientName: string;
  recipientCity: string;
  cargoType: CargoType;
  weight: number;
}

export interface Order extends OrderFormData {
  id: string;
  createdAt: string;
  status: OrderStatus;
}
