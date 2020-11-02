import { TCurrency } from '../../../../types/currency';
import { TTfItem } from '../../types';
import { ItemQualitiesByIndex } from '../../constants';

export class BpTfSummarizer {
  public summarizeCurrency = (currency: TCurrency) =>
    `${currency.keys ? `${currency.keys} keys` : ''} ${currency.metal ? `${currency.metal} ref` : ''}`;

  public summarizeItems = (items: TTfItem[]) => {
    return items.map((item) => `${
      item.particleEffect
        ? `${item.particleEffect} `
        : `${ItemQualitiesByIndex[item.quality]}`
    }${item.name}`).join(', ');
  }
}
