import { TGetItemPricesResponse, TGetUserListingsResponse, TUserListing } from './types';
import { fetch } from '../../../../api/fetch';
import { getCurrenciesEndpoint, getUserListingsEndpoint, heartbeatEndpoint } from './endpoints';
import { configData } from '../../../../api/config';
import { EListingIntent } from '../../../../types/enums';

export class BpTfApi {
  public getCurrencies = async () => {
    return fetch.get<TGetItemPricesResponse>(getCurrenciesEndpoint, {
      key: configData.bptfApiKey,
    });
  };

  public getUserListings = async () => {
    return fetch.get<TGetUserListingsResponse>(getUserListingsEndpoint, {
      token: configData.bptfAccessToken,
    });
  };

  public getUserBuyListings = ({ listings }: TGetUserListingsResponse): TUserListing[] => {
    return listings.filter((listing) => listing.intent === EListingIntent.buy);
  };

  public getUserSellListings = ({ listings }: TGetUserListingsResponse): TUserListing[] => {
    return listings.filter((listing) => listing.intent === EListingIntent.sell);
  };

  public heartbeat = async () => {
    return fetch.post(heartbeatEndpoint, {
      method: 'alive',
      steamid: configData.steamid,
      token: configData.bptfAccessToken,
    });
  };
}
