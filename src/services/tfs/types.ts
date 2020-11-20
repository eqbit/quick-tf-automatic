import { TTradeOfferHandlerOptions } from '../controller/types';
import { EListingIntent } from '../../types/enums';
import { TCurrency } from '../../types/currency';

export type TCheckTradeOptions = TTradeOfferHandlerOptions & {
  intent: EListingIntent.sell | EListingIntent.buy;
  currency?: TCurrency;
};

export type TReportTradeOptions = {
  accountSteamid: string;
  partnerSteamid: string;
  name: string;
  effect: string;
  quality: string;
  keys: number;
  metal: number;
  itemid: number;
  direction: EListingIntent.sell | EListingIntent.buy;
};

export type TReportTradeResponse = {
  status: 'success' | 'error';
};
