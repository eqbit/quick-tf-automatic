import { TCurrency } from '../../../../types/currency';

export type TGetPricesItems = {
  [name: string]: {
    defindex: number[];
    prices: {
      [key: number]: {
        Tradable: {
          Craftable: {
            [effect: number]: {
              value: number;
              currency: 'metal' | 'keys';
              difference: number;
              last_update: number;
              value_high?: number;
            }
          }
        };
      }
    }
  };
};

export type TGetItemPricesResponse = {
  response: {
    success: 1 | 0;
    current_time: number;
    raw_usd_value: number;
    usd_currency: string;
    usd_currency_index: number;
    items: TGetPricesItems;
  }
};

export type TUserListing = {
  id: string;
  steamid: string;
  item: {
    defindex: number;
    quality: number;
    attributes: unknown[];
    name: string;
    id?: number;
    original_id?: number;
    level?: number;
    inventory?: number;
    quantity?: number;
    origin?: number;
  };
  appid: number;
  currencies: TCurrency;
  offers: number;
  buyout: number;
  details: string;
  created: number;
  bump: number;
  intent: 0 | 1;
};

export type TGetUserListingsResponse = {
  listings: TUserListing[]
};
