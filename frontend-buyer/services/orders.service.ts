import { api } from '@/lib/api';
import type { Order, PaymentMethod } from '@/types';
import { API_ENDPOINTS } from '@/constants/api';

export interface CheckoutPayload {
  address_id: string;
  payment_method: PaymentMethod;
}

export const ordersService = {
  checkout: (token: string, payload: CheckoutPayload) =>
    api.post<Order>(API_ENDPOINTS.ORDERS.CHECKOUT, payload, { token }),

  getMyOrders: (token: string) =>
    api.get<Order[]>(API_ENDPOINTS.ORDERS.MINE, { token }),
};
