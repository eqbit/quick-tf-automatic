import { TTfItem } from '../tf/types';
import { TTradeOffer } from '../trade-offer-manager/types';

export type TTradeOfferHandlerOptions = {
  ourItems: Array<TTfItem>,
  theirItems: Array<TTfItem>,
  rawOffer: TTradeOffer;
}
