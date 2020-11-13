import * as TradeOfferManagerProvider from 'steam-tradeoffer-manager';
import { getCookies, savePollData } from '../../utils/fs';
import { TRADE_OFFER_MANAGER_POLL_INTERVAL } from '../../constants';
import { TTradeOffer, TTradeOfferManagerConstructor } from './types';
import { offerStateToHumanReadable } from './utils';
import { convertToTfItem } from '../tf/utils';
import { TTradeOfferHandlerOptions } from '../controller/types';
import { ETradeOfferState } from './data';

export class TradeOfferManager {
  private manager: TradeOfferManagerProvider;

  private readonly onNewOffer: (data: TTradeOfferHandlerOptions) => void;

  private readonly onFail: () => Promise<void>;

  constructor({ steam, onNewOffer, onFail }: TTradeOfferManagerConstructor) {
    this.manager = new TradeOfferManagerProvider({
      language: 'en',
      community: steam,
      domain: 'backpack.tf',
      pollInterval: TRADE_OFFER_MANAGER_POLL_INTERVAL,
    });

    this.onNewOffer = onNewOffer;
    this.onFail = onFail;
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
  };

  public init = async () => {
    await this.setCookies();

    this.manager.on('newOffer', this.handleOffer);
    this.manager.on('receivedOfferChanged', this.handleOfferStateChange);
    this.manager.on('pollData', savePollData);
  };

  public reInit = async () => {
    await this.onFail();
    await this.setCookies();
  };

  private reachItemsFromOffer = (rawOffer:TTradeOffer) => {
    const ourItems = rawOffer.itemsToGive.map(convertToTfItem);
    const theirItems = rawOffer.itemsToReceive.map(convertToTfItem);
    return [ourItems, theirItems];
  };

  private handleOffer = (rawOffer: TTradeOffer) => {
    const [ourItems, theirItems] = this.reachItemsFromOffer(rawOffer);
    this.onNewOffer({ ourItems, theirItems, rawOffer });
  };

  public acceptOffer = (rawOffer: TTradeOffer) => {
    return new Promise((resolve, reject) => {
      rawOffer.accept((error, status) => {
        if (error) {
          reject(error);
        }
        resolve(status);
      });
    }).catch(async () => {
      await this.reInit();
      if (rawOffer.state === ETradeOfferState.Active) {
        this.acceptOffer(rawOffer);
      }
    });
  };

  private handleOfferStateChange = (offer: TTradeOffer) => {
    console.log(`Offer #${offer.id} changed: ${offerStateToHumanReadable(offer.state)}`);
  };
}
