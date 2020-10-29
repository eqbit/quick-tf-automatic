import * as TradeOfferManagerProvider from 'steam-tradeoffer-manager';
import * as SteamCommunity from 'steamcommunity';
import { getCookies, savePollData } from '../../utils/fs';
import { TRADE_OFFER_MANAGER_POLL_INTERVAL } from '../../constants';
import { TTradeOffer } from './types';
import { offerStateToHumanReadable } from './utils';
import { convertToTfItem } from '../tf/utils';

export class TradeOfferManager {
  private manager: TradeOfferManagerProvider;

  constructor(steam: SteamCommunity) {
    this.manager = new TradeOfferManagerProvider({
      language: 'en',
      community: steam,
      domain: 'backpack.tf',
      pollInterval: TRADE_OFFER_MANAGER_POLL_INTERVAL,
    });
  }

  private setCookies = async () => {
    const cookies = await getCookies();

    return new Promise((resolve, reject) => {
      this.manager.setCookies(cookies, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  public init = async () => {
    await this.setCookies();

    this.manager.on('newOffer', this.handleOffer);
    this.manager.on('receivedOfferChanged', this.handleOfferStateChange);
    this.manager.on('pollData', savePollData);
  };

  private reachItemsFromOffer = (rawOffer:TTradeOffer) => {
    const ourItems = rawOffer.itemsToGive.map(convertToTfItem);
    const theirItems = rawOffer.itemsToReceive.map(convertToTfItem);
    return [ourItems, theirItems];
  };

  private handleOffer = (rawOffer: TTradeOffer) => {
    const [ourItems, theirItems] = this.reachItemsFromOffer(rawOffer);
    console.log(ourItems);
    console.log(theirItems);
  };

  private acceptOffer = (offer) => {
    return new Promise((resolve, reject) => {
      offer.accept((error, status) => {
        if (error) {
          reject(error);
        }
        resolve(status);
      });
    });
  };

  private handleOfferStateChange = (offer: TTradeOffer) => {
    console.log(`Offer #${offer.id} changed: ${offerStateToHumanReadable(offer.state)}`);
  };
}
