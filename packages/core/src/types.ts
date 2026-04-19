export type AppRole = 'ADMIN' | 'USER';

/** Mirrors AppUserDto.Me on the backend. */
export interface Me {
  id: number;
  email: string;
  displayName: string | null;
  role: AppRole;
  active: boolean;
  hasZerodha: boolean;
  hasFivepaisa: boolean;
  zerodhaAccessTokenExpiresAt: string | null;
  fivepaisaJwtExpiresAt: string | null;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  expiresInSeconds: number;
  user: Me;
}

/** Mirrors AppUserDto.AdminRow. */
export interface AdminRow {
  id: number;
  email: string;
  displayName: string | null;
  role: AppRole;
  active: boolean;
  hasZerodha: boolean;
  hasFivepaisa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ZerodhaProfile {
  brokerUserId: string;
  apiKey: string;
  apiSecret: string;
  label?: string | null;
  defaultExchange?: string | null;
  defaultProduct?: string | null;
  defaultOrderType?: string | null;
  defaultQuantity?: number | null;
  defaultVariety?: string | null;
}

export interface FivePaisaProfile {
  brokerUserId: string;
  appName: string;
  encryptKey: string;
  userKey: string;
  fivepaisaUserId: string;
  password: string;
  loginId: string;
  clientCode: string;
  label?: string | null;
  appVer?: string | null;
  osName?: string | null;
  defaultExchange?: string | null;
  defaultExchangeType?: string | null;
  defaultQuantity?: number | null;
  defaultAtMarket?: boolean | null;
  defaultIsIntraday?: boolean | null;
}

export interface BrokerProfiles {
  zerodha?: ZerodhaProfile | null;
  fivepaisa?: FivePaisaProfile | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string | null;
  brokers?: BrokerProfiles | null;
}

export interface ZerodhaSessionResponse {
  broker: 'zerodha';
  brokerUserId: string;
  accessToken: string;
  publicToken: string;
  expiresAt: string;
}

export interface FivepaisaSessionResponse {
  broker: '5paisa';
  brokerUserId: string;
  jwt: string;
  expiresAt: string;
}

/** Pushed from the backend Chartink webhook over SSE ("chartink" event). */
export interface StockTile {
  tradingsymbol: string;
  exchange: string;
  transactionType: 'BUY' | 'SELL';
  triggerPrice: number | null;
  scanName: string | null;
  alertName: string | null;
  scanUrl: string | null;
  receivedAt: string;
}

export interface TradeRequest {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  orderType?: 'MARKET' | 'LIMIT';
  price?: number;
  product?: string;
  variety?: string;
  validity?: string;
}
