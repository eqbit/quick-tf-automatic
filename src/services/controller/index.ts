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

    await this.steam.init();
    await this.manager.init();

    this.initLoops();
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
    const buyListings = this.tfComparator.findBuyListings(
      this.getBuyListings(),
      theirItems,
    );

    const sellListings = this.tfComparator.findSellListings(
      this.getSellListings(),
      ourItems,
    );

    console.log(buyListings);
    console.log(sellListings);
  }
}
