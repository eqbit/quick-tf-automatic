import * as TradeOfferManagerProvider from 'steam-tradeoffer-manager';
import * as SteamCommunity from 'steamcommunity';
import { getCookies, savePollData } from '../../utils/fs';
import { TRADE_OFFER_MANAGER_POLL_INTERVAL } from '../../constants';
import { TTradeOffer } from './types';

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

  private async setCookies() {
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

  public async init() {
    await this.setCookies();

    this.manager.on('newOffer', this.handleOffer);
    this.manager.on('receivedOfferChanged', this.handleOfferChange);
    this.manager.on('pollData', savePollData);
  }

  private handleOffer(rawOffer: TTradeOffer) {
    console.log(rawOffer.itemsToGive[0].owner_actions);
  }

  private handleOfferChange(offer) {
    console.log(offer);
  }
}
