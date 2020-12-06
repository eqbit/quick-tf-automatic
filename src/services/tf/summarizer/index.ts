import { TCurrency } from '../../../types/currency';
import { TTfItem } from '../types';
import { ItemQualitiesByIndex } from '../constants';
import { TSummarizeBuyOrder, TSummarizeSellOrder } from './types';
import { TelegramSender } from '../../telegram';
import { logger } from '../../logger';

export class BpTfSummarizer {
  protected telegram: TelegramSender;

  constructor(telegram: TelegramSender) {
    this.telegram = telegram;
  }

  public summarizeCurrency = (currency: TCurrency) =>
    `${currency.keys ? `${currency.keys} keys` : ''} ${currency.metal ? `${currency.metal} ref` : ''}`;

  public summarizeItems = (items: TTfItem[]) => {
    return items.map((item) => `${
      item.particleEffect
        ? `${item.particleEffect} `
        : `${ItemQualitiesByIndex[item.quality]} `
    }${item.name}`).join(', ');
  };

  public successBuyOrderMessage = (
    {
      id,
      rawItemsToBuy,
      priceWePay,
      priceTheyAsk,
    }: TSummarizeBuyOrder,
  ) => {
    const message = `Accepting offer #${id}. Buying ${
      this.summarizeItems(rawItemsToBuy)
    } (${
      this.summarizeCurrency(priceWePay)
    } according to our buy listings) for ${
      this.summarizeCurrency(priceTheyAsk)
    }`;
    logger.log(message);
    this.telegram.sendMessage(message);
  };

  public failBuyOrderMessage = (
    {
      id,
      priceWePay,
      priceTheyAsk,
      rawItemsToBuy,
    }: TSummarizeBuyOrder,
  ) => {
    logger.error(`According to our buy order listings we are ready to pay ${
      this.summarizeCurrency(priceWePay)
    } for ${
      this.summarizeItems(rawItemsToBuy)
    }. The sellers asks for more: ${
      this.summarizeCurrency(priceTheyAsk)
    }. Skipping offer #${id}...`);
  };

  public successSellOrderMessage = (
    {
      id,
      rawItemsToSell,
      priceWeAsk,
      priceTheyPay,
    }: TSummarizeSellOrder,
  ) => {
    const message = `Accepting offer #${id}. Selling ${
      this.summarizeItems(rawItemsToSell)
    } (${
      this.summarizeCurrency(priceWeAsk)
    } according to our sell listings) for ${
      this.summarizeCurrency(priceTheyPay)
    }`;
    logger.log(message);
    this.telegram.sendMessage(message);
  };

  public failSellOrderMessage = (
    {
      id,
      rawItemsToSell,
      priceWeAsk,
      priceTheyPay,
    }: TSummarizeSellOrder,
  ) => {
    logger.error(`We asking ${
      this.summarizeCurrency(priceWeAsk)
    } for our ${
      this.summarizeItems(rawItemsToSell)
    }. The buyer offers less: ${
      this.summarizeCurrency(priceTheyPay)
    }. Skipping offer #${id}...`);
  };
}
