import { TradeOfferManager } from '../trade-offer-manager';
import { Steam } from '../steam';
import { TGetUserListingsResponse } from '../tf/bptf/api/types';
import { BpTfApi } from '../tf/bptf/api';
import { HEARTBEAT_INTERVAL, LISTINGS_UPDATE_INTERVAL } from '../../constants';
import { TTradeOfferHandlerOptions } from './types';
import { BpTfComparator } from '../tf/bptf/comparator';
import { BpTfSummarizer } from '../tf/summarizer';
import { TTradeOffer } from '../trade-offer-manager/types';
import { TelegramSender } from '../telegram';
import { configData } from '../../api/config';
import { getSteamid64 } from '../../utils/get-steamid';
import { Totp } from '../totp';
import { checkTrade } from '../tfs';
import { EListingIntent } from '../../types/enums';

export class Controller {
  private telegram = new TelegramSender({
    botApiKey: configData.telegramApiToken,
    channelName: configData.telegramNotificationChannel,
  });
  private manager: TradeOfferManager;
  private steam: Steam;
  private bpTfApi = new BpTfApi();
  private bptfListings: TGetUserListingsResponse;
  private tfComparator = new BpTfComparator();
  private bpTfSummarizer = new BpTfSummarizer(this.telegram);
  private totp: Totp;

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

    this.totp = new Totp({
      steam: this.steam,
      secret: configData.identity_secret,
    });
    this.totp.enable();
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

  private isInEscrow = (rawOffer: TTradeOffer) => {
    return Boolean(rawOffer.escrowEnds);
  };

  private handleNewTradeOffer = ({ ourItems, theirItems, rawOffer }: TTradeOfferHandlerOptions) => {
    if (rawOffer.isOurOffer) {
      console.log('Accepting an offer sent by the Owner');
      this.acceptOffer(rawOffer);
      return;
    }
    this.telegram
      .sendMessage(`Received a new trade offer from https://backpack.tf/profiles/${getSteamid64(rawOffer.partner)}`);

    if (this.isInEscrow(rawOffer)) {
      console.log('Escrow is not turned off. Skipping...');
      return;
    }

    if (!ourItems.length || !theirItems.length) {
      console.log('A gift offer. Skipping...');
      return;
    }

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
      this.bpTfSummarizer.successBuyOrderMessage({
        id: rawOffer.id,
        priceTheyAsk,
        priceWePay,
        rawItemsToBuy,
      });

      checkTrade({
        intent: EListingIntent.buy,
        currency: priceTheyAsk,
        rawOffer,
        theirItems,
        ourItems,
      });

      this.acceptOffer(rawOffer).then(() => {
        console.log(`Offer #${rawOffer.id} successfully accepted, additional confirmation needed`);
      }).catch((error) => {
        console.log(`Error accepting offer #${rawOffer.id}: `, error);
      });
    } else {
      this.bpTfSummarizer.failBuyOrderMessage({
        id: rawOffer.id,
        priceTheyAsk,
        priceWePay,
        rawItemsToBuy,
      });
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
      this.bpTfSummarizer.successSellOrderMessage({
        id: rawOffer.id,
        priceTheyPay,
        priceWeAsk,
        rawItemsToSell,
      });

      checkTrade({
        intent: EListingIntent.sell,
        currency: priceTheyPay,
        rawOffer,
        theirItems,
        ourItems,
      });

      this.acceptOffer(rawOffer).then(() => {
        console.log(`Offer #${rawOffer.id} successfully accepted, additional confirmation needed`);
      }).catch((error) => {
        console.log(`Error accepting offer #${rawOffer.id}: `, error);
      });
    } else {
      this.bpTfSummarizer.failSellOrderMessage({
        id: rawOffer.id,
        priceTheyPay,
        priceWeAsk,
        rawItemsToSell,
      });
    }
  };

  protected acceptOffer = async (rawOffer: TTradeOffer) => {
    return this.manager.acceptOffer(rawOffer).then(() => {
      this.totp.addOffer(rawOffer.id);
      this.totp.check();
    });
  };
}
