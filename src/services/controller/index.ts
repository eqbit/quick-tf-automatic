import { TradeOfferManager } from '../trade-offer-manager';
import { Steam } from '../steam';

export class Controller {
  private manager: TradeOfferManager;

  private steam: Steam;

  public async init() {
    this.steam = new Steam();
    this.manager = new TradeOfferManager(this.steam.getCommunity());

    await this.steam.init();
    await this.manager.init();
  }
}
