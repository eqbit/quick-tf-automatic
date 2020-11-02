import { TradeOfferManager } from '../trade-offer-manager';
import { Steam } from '../steam';
import { TGetUserListingsResponse } from '../tf/bptf/api/types';
import { BpTfApi } from '../tf/bptf/api';
import { LISTINGS_UPDATE_INTERVAL, HEARTBEAT_INTERVAL } from '../../constants';
import { TTradeOfferHandlerOptions } from './types';
import { BpTfComparator } from '../tf/bptf/comparator';
import { BpTfSummarizer } from '../tf/bptf/summarizer';

export class Controller {
  private manager: TradeOfferManager;

  private steam: Steam;

  private bpTfApi = new BpTfApi();

  private bptfListings: TGetUserListingsResponse;

  private tfComparator = new BpTfComparator();

  private bpTfSummarizer = new BpTfSummarizer();

  public init = async () => {
    this.steam = new Steam();
    this.manager = new TradeOfferManager({
      steam: this.steam.getCommunity(),
      onNewOffer: this.handleNewTradeOffer,
      onFail: this.reInit,
    });

    this.initLoops();

    await this.steam.init();
    await this.manager.init();
  };

  public reInit = async () => {
    await this.steam.init();
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
  };

  private heartbeat = async () => {
    await this.bpTfApi.heartbeat();
  };

  private getBuyListings = () => {
    return this.bpTfApi.getUserBuyListings(this.bptfListings);
  };

  private getSellListings = () => {
    return this.bpTfApi.getUserSellListings(this.bptfListings);
  };

  private handleNewTradeOffer = ({ ourItems, theirItems, rawOffer }: TTradeOfferHandlerOptions) => {
    const rawItemsToBuy = this.tfComparator.extractItemsFromOffer(theirItems);
    const rawItemsToSell = this.tfComparator.extractItemsFromOffer(ourItems);

    if (rawItemsToBuy.length && rawItemsToSell.length) {
      console.log('Offer contains items from both sides. Skipping...');
      return;
    }

    const fitSellListings = this.tfComparator.findSellListings(
      this.getSellListings(),
      ourItems,
    );

    if (rawItemsToSell.length && fitSellListings.length) {
      return this.processSellOrder({ ourItems, theirItems, rawOffer });
    }

    const fitBuyListings = this.tfComparator.findBuyListings(
      this.getBuyListings(),
      theirItems,
    );

    if (rawItemsToBuy.length && fitBuyListings.length) {
      return this.processBuyOrder({ ourItems, theirItems, rawOffer });
    }

    console.log('Offer doesn\'t math any criteria. Skipping...');
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

    let containsExtraItems = false;

    rawItemsToBuy.forEach((item) => {
      const listing = this.tfComparator.findMatchingListing(fitBuyListings, item);
      const currency = this.tfComparator.extractCurrencyFromListing(listing);

      if (!currency) {
        containsExtraItems = true;
      }

      priceWePay.keys += currency.keys;
      priceWePay.metal = Math.floor(priceWePay.metal * 100 + currency.metal * 100) / 100;
    });

    if (containsExtraItems) {
      console.log('Offer contains items we have no buy orders for. Skipping...');
      return;
    }

    if (
      priceTheyAsk.keys <= priceWePay.keys
      && priceTheyAsk.metal <= priceWePay.metal
    ) {
      console.log(`Accepting offer #${rawOffer.id}.`);
      console.log(`Buying ${
        this.bpTfSummarizer.summarizeItems(rawItemsToBuy)
      } (${
        this.bpTfSummarizer.summarizeCurrency(priceWePay)
      } according to our buy listings) for ${
        this.bpTfSummarizer.summarizeCurrency(priceTheyAsk)
      }`);

      this.manager.acceptOffer(rawOffer).then(() => {
        console.log(`Offer #${rawOffer.id} successfully accepted, additional confirmation needed`);
      }).catch((error) => {
        console.log(`Error accepting offer #${rawOffer.id}: `, error);
      });
    } else {
      console.log(`According to our buy order listings we are ready to pay ${
        this.bpTfSummarizer.summarizeCurrency(priceWePay)
      } for ${
        this.bpTfSummarizer.summarizeItems(rawItemsToBuy)
      }. The sellers asks for more: ${
        this.bpTfSummarizer.summarizeCurrency(priceTheyAsk)
      }. Skipping...`);
    }
  };

  private processSellOrder = ({ ourItems, theirItems, rawOffer }: TTradeOfferHandlerOptions) => {
    const rawOurCurrency = this.tfComparator.extractCurrencyFromOffer(ourItems);

    if (rawOurCurrency.metal || rawOurCurrency.keys) {
      console.log('Unexpectedly asking currency from our side. Skipping...');
      return;
    }

    const fitSellListings = this.tfComparator.findSellListings(
      this.getSellListings(),
      ourItems,
    );

    const priceTheyPay = this.tfComparator.extractCurrencyFromOffer(theirItems);
    const priceWeAsk = {
      keys: 0,
      metal: 0,
    };

    const rawItemsToSell = this.tfComparator.extractItemsFromOffer(ourItems);

    let containsExtraItems = false;

    rawItemsToSell.forEach((item) => {
      const listing = this.tfComparator.findMatchingSellListing(fitSellListings, item);
      const currency = this.tfComparator.extractCurrencyFromListing(listing);

      if (!currency) {
        containsExtraItems = true;
        return;
      }

      priceWeAsk.keys += currency.keys || 0;
      priceWeAsk.metal = Math.floor(priceWeAsk.metal * 100 + currency.metal * 100) / 100;
    });

    if (containsExtraItems) {
      console.log('Trying to buy an item we don\'t sell. Skipping...');
      return;
    }

    if (
      priceTheyPay.keys >= priceWeAsk.keys
      && priceTheyPay.metal >= priceWeAsk.metal
    ) {
      console.log(`Accepting offer #${rawOffer.id}.`);
      console.log(`Selling ${
        this.bpTfSummarizer.summarizeItems(rawItemsToSell)
      } (${
        this.bpTfSummarizer.summarizeCurrency(priceWeAsk)
      } according to our sell listings) for ${
        this.bpTfSummarizer.summarizeCurrency(priceTheyPay)
      }`);

      this.manager.acceptOffer(rawOffer).then(() => {
        console.log(`Offer #${rawOffer.id} successfully accepted, additional confirmation needed`);
      }).catch((error) => {
        console.log(`Error accepting offer #${rawOffer.id}: `, error);
      });
    } else {
      console.log(`We asking ${
        this.bpTfSummarizer.summarizeCurrency(priceWeAsk)
      } for our ${
        this.bpTfSummarizer.summarizeItems(rawItemsToSell)
      }. The buyer offers less: ${
        this.bpTfSummarizer.summarizeCurrency(priceTheyPay)
      }. Skipping...`);
    }
  }
}
