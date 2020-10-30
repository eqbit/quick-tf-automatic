import { TUserListing } from '../api/types';
import { TTfItem } from '../../types';

export class BpTfComparator {
  public findBuyListings = (buyListings: TUserListing[], theirItems: TTfItem[]) => {
    const result: TUserListing[] = [];

    theirItems.forEach((theirItem) => {
      const buyListing = buyListings.find((listing) => {
        return listing.item.name === `${theirItem.particleEffect} ${theirItem.name}`
          && String(listing.item.quality) === theirItem.quality;
      });

      if (buyListing) {
        result.push(buyListing);
      }
    });

    return result;
  };

  public findSellListings = (sellListings: TUserListing[], ourItems: TTfItem[]) => {
    const result: TUserListing[] = [];

    ourItems.forEach((ourItem) => {
      const sellListing = sellListings.find((listing) => {
        return listing.item.name === `${ourItem.particleEffect} ${ourItem.name}`
          && String(listing.item.quality) === ourItem.quality;
      });

      if (sellListing) {
        result.push(sellListing);
      }
    });

    return result;
  };
}
