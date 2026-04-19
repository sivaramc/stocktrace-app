import type { StockTile, TradeRequest } from './types';

/**
 * Builds a TradeRequest for a given tile + side. A non-null `triggerPrice`
 * (including 0) turns the order into a LIMIT order at that price; otherwise
 * a MARKET order is used.
 */
export function buildTradeRequest(
  tile: StockTile,
  side: 'BUY' | 'SELL',
  quantity = 1,
): TradeRequest {
  void side;
  return {
    tradingsymbol: tile.tradingsymbol,
    exchange: tile.exchange,
    quantity,
    orderType: tile.triggerPrice !== null ? 'LIMIT' : 'MARKET',
    price: tile.triggerPrice ?? undefined,
  };
}
