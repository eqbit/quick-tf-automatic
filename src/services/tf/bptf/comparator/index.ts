import { TUserListing } from '../api/types';
import { TTfItem } from '../../types';
import {
  addRec,
  addScrap,
  isCurrency,
  isKey,
  isRec,
  isRef,
  isScrap,
} from './utils';

export class BpTfComparator {
  public findMatchingListing = (listings: TUserListing[], item: TTfItem) => {
    return listings.find((listing) => {
      return listing.item.quality === item.quality
        && (
          listing?.item?.name === `${item.particleEffect} ${item.name}`
          || listing?.item?.name === item.name
        );
    });
  };

  public findBuyListings = (buyListings: TUserListing[], theirItems: TTfItem[]) => {
    const result: TUserListing[] = [];

    theirItems.forEach((theirItem) => {
      const matchingListing = this.findMatchingListing(buyListings, theirItem);
      if (matchingListing) {
        result.push(matchingListing);
      }
    });

    return result;
  };

  public findMatchingSellListing = (sellListings: TUserListing[], item: TTfItem) => {
    return sellListings.find((listing) => {
      return listing?.item.id === item.id;
    });
  };

  public findSellListings = (sellListings: TUserListing[], ourItems: TTfItem[]) => {
    const result: TUserListing[] = [];

    ourItems.forEach((ourItem) => {
      const matchingListing = this.findMatchingSellListing(sellListings, ourItem);
      if (matchingListing) {
        result.push(matchingListing);
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
    return {
      keys: listing?.currencies?.keys || 0,
      metal: listing?.currencies?.metal || 0,
    };
  }
}
