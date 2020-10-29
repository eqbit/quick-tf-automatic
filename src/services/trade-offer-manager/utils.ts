import { ETradeOfferState } from './data';

export const offerStateToHumanReadable = (state: number) => ETradeOfferState[state];
