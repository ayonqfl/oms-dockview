export interface SymbolItem {
  symbol: string;
  company_name: string;
  sector?: string;
  category?: string;
  coup_rate?: number;
  yield?: number;
  ltp: number;
  close: number;
  ycp?: number;
  volume: number;
  change: number;
  change_per: number;
  bid?: number;
  bidqty?: number;
  ask?: number;
  askqty?: number;
  trades?: number;
  turnover?: number;
  open?: number;
  high?: number;
  low?: number;
  last_vol: number;
}