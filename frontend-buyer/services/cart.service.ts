import { api } from '@/lib/api';
import type { CartItem } from '@/types';
import { API_ENDPOINTS } from '@/constants/api';

export interface AddToCartPayload {
  product_id: string;
  quantity: number;
  custom_note?: string;
}

export const cartService = {
  getCart: (token: string) =>
    api.get<CartItem[]>(API_ENDPOINTS.ORDERS.CART, { token }),

  addItem: (token: string, payload: AddToCartPayload) =>
    api.post<CartItem>(API_ENDPOINTS.ORDERS.CART, payload, { token }),

  removeItem: (token: string, productId: string) =>
    api.delete<void>(API_ENDPOINTS.ORDERS.CART_ITEM(productId), { token }),
};
