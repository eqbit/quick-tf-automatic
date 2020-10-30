import { TUserListing } from '../api/types';
import { TTfItem } from '../../types';
import {
  addRec, addScrap, isCurrency,
  isKey,
  isRec,
  isRef,
  isScrap,
} from './utils';

export class BpTfComparator {
  public findMatchingListing = (listings: TUserListing[], item: TTfItem) => {
    return listings.find((listing) => {
      return listing.item.name === `${item.particleEffect} ${item.name}`
        && listing.item.quality === item.quality;
    });
  };

  public findBuyListings = (buyListings: TUserListing[], theirItems: TTfItem[]) => {
    const result: TUserListing[] = [];

    theirItems.forEach((theirItem) => {
      const buyListing = this.findMatchingListing(buyListings, theirItem);

      if (buyListing) {
        result.push(buyListing);
      }
    });

    return result;
  };

  public findSellListings = (sellListings: TUserListing[], ourItems: TTfItem[]) => {
    const result: TUserListing[] = [];

    ourItems.forEach((ourItem) => {
      const sellListing = this.findMatchingListing(sellListings, ourItem);

      if (sellListing) {
        result.push(sellListing);
      }
    });

    return result;
  };

  public extractCurrencyFromOffer = (items: TTfItem[]) => {
    const result = {
      keys: 0,
      metal: 0,
    };

    items.forEach((item) => {
      if (isKey(item)) {
        result.keys += 1;
        return;
      }

      if (isRef(item)) {
        result.metal += 1;
        return;
      }

      if (isRec(item)) {
        result.metal = addRec(result.metal);
        return;
      }

      if (isScrap(item)) {
        result.metal = addScrap(result.metal);
      }
    });

    return result;
  };

  public extractItemsFromOffer = (items: Array<TTfItem>) => {
    return items.filter((item) => !isCurrency(item));
  };

  public extractCurrencyFromListing = (listing: TUserListing) => {
    return listing.currencies;
  }
}
