import { TradeOfferManager } from '../trade-offer-manager';
import { Steam } from '../steam';
import { TGetUserListingsResponse } from '../tf/bptf/api/types';
import { BpTfApi } from '../tf/bptf/api';
import { LISTINGS_UPDATE_INTERVAL, HEARTBEAT_INTERVAL } from '../../constants';
import { TTradeOfferHandlerOptions } from './types';
import { BpTfComparator } from '../tf/bptf/comparator';

export class Controller {
  private manager: TradeOfferManager;

  private steam: Steam;

  private bpTfApi = new BpTfApi();

  private bptfListings: TGetUserListingsResponse;

  private tfComparator = new BpTfComparator();

  public init = async () => {
    this.steam = new Steam();
    this.manager = new TradeOfferManager({
      steam: this.steam.getCommunity(),
      onNewOffer: this.handleNewTradeOffer,
    });

    this.initLoops();

    await this.steam.init();
    await this.manager.init();
  };

  private initLoops = async () => {
    await this.updateUserListings().then(() => {
      setInterval(() => {
        this.updateUserListings();
      }, LISTINGS_UPDATE_INTERVAL);

      this.heartbeat().then(() => {
        setInterval(() => {
          this.heartbeat();
        }, HEARTBEAT_INTERVAL);
      });
    });
  };

  private updateUserListings = async () => {
    this.bptfListings = await this.bpTfApi.getUserListings();
    console.log('Updated backpack.tf listings.');
  };

  private heartbeat = async () => {
    await this.bpTfApi.heartbeat();
    console.log('Heartbeat sent to backpack.tf');
  };

  private getBuyListings = () => {
    return this.bpTfApi.getUserBuyListings(this.bptfListings);
  };

  private getSellListings = () => {
    return this.bpTfApi.getUserSellListings(this.bptfListings);
  };

  private handleNewTradeOffer = ({ ourItems, theirItems, rawOffer }: TTradeOfferHandlerOptions) => {
    const rawItemsToBuy = this.tfComparator.extractItemsFromOffer(theirItems);
    const fitBuyListings = this.tfComparator.findBuyListings(
      this.getBuyListings(),
      theirItems,
    );

    if (rawItemsToBuy.length && fitBuyListings.length) {
      this.processBuyOrder({ ourItems, theirItems, rawOffer });
    }
  };

  private processBuyOrder = ({ ourItems, theirItems, rawOffer }: TTradeOfferHandlerOptions) => {
    const fitBuyListings = this.tfComparator.findBuyListings(
      this.getBuyListings(),
      theirItems,
    );

    const priceTheyAsk = this.tfComparator.extractCurrencyFromOffer(ourItems);
    const rawItemsToBuy = this.tfComparator.extractItemsFromOffer(theirItems);

    const priceWePay = {
      keys: 0,
      metal: 0,
    };

    let containsExtraStuff = false;

    rawItemsToBuy.forEach((item) => {
      const listing = this.tfComparator.findMatchingListing(fitBuyListings, item);
      if (!listing) {
        containsExtraStuff = true;
        return;
      }

      const currency = this.tfComparator.extractCurrencyFromListing(listing);

      priceWePay.keys += currency.keys;
      priceWePay.metal = Math.floor(priceWePay.metal * 100 + currency.metal * 100) / 100;
    });

    if (containsExtraStuff) {
      console.log('Offer contains items we have no buy orders for. Skipping...');
      return;
    }

    if (
      priceTheyAsk.keys <= priceWePay.keys
      && priceTheyAsk.metal <= priceWePay.metal
    ) {
      console.log(`Accepting offer #${rawOffer.id}.`);
      this.manager.acceptOffer(rawOffer).then(() => {
        console.log(`Offer #${rawOffer.id} successfully accepted, additional confirmation needed`);
      }).catch((error) => {
        console.log(`Error accepting offer #${rawOffer.id}: `, error);
      });
    } else {
      console.log('Asking too much from us. Skipping.');
    }
  }

  // private processSellOrder = ({ ourItems, theirItems, rawOffer }: TTradeOfferHandlerOptions) => {
  //   const fitSellListings = this.tfComparator.findSellListings(
  //     this.getSellListings(),
  //     ourItems,
  //   );
  //   const rawItemsToSell = this.tfComparator.extractItemsFromOffer(ourItems);
  //   const rawOurCurrency = this.tfComparator.extractCurrencyFromOffer(ourItems);
  //   const rawTheirCurrency = this.tfComparator.extractCurrencyFromOffer(theirItems);
  // }
}
