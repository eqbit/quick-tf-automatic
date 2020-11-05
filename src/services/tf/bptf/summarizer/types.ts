import { TTfItem } from '../../types';
import { TCurrency } from '../../../../types/currency';

export type TSummarizeBuyOrder = {
  id: string;
  rawItemsToBuy: TTfItem[];
  priceWePay: TCurrency;
  priceTheyAsk: TCurrency;
};

export type TSummarizeSellOrder = {
  id: string;
  rawItemsToSell: TTfItem[];
  priceWeAsk: TCurrency;
  priceTheyPay: TCurrency;
};
