import { api } from '@/lib/api';
import type { AuthResult, User, Address } from '@/types';
import { API_ENDPOINTS } from '@/constants/api';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResult>(API_ENDPOINTS.AUTH.REGISTER, payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResult>(API_ENDPOINTS.AUTH.LOGIN, payload),

  getMe: (token: string) =>
    api.get<User>(API_ENDPOINTS.USERS.ME, { token }),

  updateProfile: (token: string, payload: Partial<Pick<User, 'full_name' | 'avatar_url'>>) =>
    api.patch<User>(API_ENDPOINTS.USERS.ME, payload, { token }),

  getAddresses: (token: string) =>
    api.get<Address[]>(API_ENDPOINTS.USERS.ADDRESSES, { token }),

  createAddress: (token: string, payload: Omit<Address, 'id'>) =>
    api.post<Address>(API_ENDPOINTS.USERS.ADDRESSES, payload, { token }),

  updateAddress: (token: string, id: string, payload: Partial<Omit<Address, 'id'>>) =>
    api.patch<Address>(API_ENDPOINTS.USERS.ADDRESS(id), payload, { token }),

  deleteAddress: (token: string, id: string) =>
    api.delete<void>(API_ENDPOINTS.USERS.ADDRESS(id), { token }),
};
