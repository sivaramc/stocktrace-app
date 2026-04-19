import type { AxiosInstance } from 'axios';
import type {
  AdminRow,
  AppRole,
  FivepaisaSessionResponse,
  LoginResponse,
  Me,
  RegisterRequest,
  TradeRequest,
  ZerodhaSessionResponse,
} from './types';

export interface Endpoints {
  login(email: string, password: string): Promise<LoginResponse>;
  register(body: RegisterRequest): Promise<Me>;
  me(): Promise<Me>;
  listUsers(): Promise<AdminRow[]>;
  activateUser(id: number): Promise<AdminRow>;
  deactivateUser(id: number): Promise<AdminRow>;
  changeUserRole(id: number, role: AppRole): Promise<AdminRow>;
  zerodhaLoginUrl(): Promise<string>;
  exchangeZerodha(requestToken: string): Promise<ZerodhaSessionResponse>;
  exchangeFivepaisa(totp: string, pin: string): Promise<FivepaisaSessionResponse>;
  placeBuy(req: TradeRequest): Promise<unknown>;
  placeSell(req: TradeRequest): Promise<unknown>;
}

export function createEndpoints(axios: AxiosInstance): Endpoints {
  return {
    async login(email, password) {
      const res = await axios.post<LoginResponse>('/api/auth/login', { email, password });
      return res.data;
    },
    async register(body) {
      const res = await axios.post<Me>('/api/auth/register', body);
      return res.data;
    },
    async me() {
      const res = await axios.get<Me>('/api/auth/me');
      return res.data;
    },
    async listUsers() {
      const res = await axios.get<AdminRow[]>('/api/admin/users');
      return res.data;
    },
    async activateUser(id) {
      const res = await axios.post<AdminRow>(`/api/admin/users/${id}/activate`);
      return res.data;
    },
    async deactivateUser(id) {
      const res = await axios.post<AdminRow>(`/api/admin/users/${id}/deactivate`);
      return res.data;
    },
    async changeUserRole(id, role) {
      const res = await axios.post<AdminRow>(`/api/admin/users/${id}/role`, { role });
      return res.data;
    },
    async zerodhaLoginUrl() {
      const res = await axios.get<{ loginUrl: string }>('/api/trade-on/zerodha/login-url');
      return res.data.loginUrl;
    },
    async exchangeZerodha(requestToken) {
      const res = await axios.post<ZerodhaSessionResponse>('/api/trade-on/zerodha', {
        requestToken,
      });
      return res.data;
    },
    async exchangeFivepaisa(totp, pin) {
      const res = await axios.post<FivepaisaSessionResponse>('/api/trade-on/fivepaisa', {
        totp,
        pin,
      });
      return res.data;
    },
    async placeBuy(req) {
      const res = await axios.post('/api/trade/buy', req);
      return res.data;
    },
    async placeSell(req) {
      const res = await axios.post('/api/trade/sell', req);
      return res.data;
    },
  };
}
