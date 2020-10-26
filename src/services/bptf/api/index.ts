import { fetch } from '../../../api/fetch';
import { getCurrenciesEndpoint, getUserListingsEndpoint } from './endpoints';
import { configData } from '../../../api/config';
import { TGetItemPricesResponse, TGetUserListingsResponse } from './types';
import { EListingIntent } from '../../../types/enums';

export const bpTfApi = {
  getCurrencies: async () => {
    return fetch.get<TGetItemPricesResponse>(getCurrenciesEndpoint, {
      key: configData.bptfApiKey,
    });
  },

  getUserListings: async () => {
    return fetch.get<TGetUserListingsResponse>(getUserListingsEndpoint, {
      token: configData.bptfAccessToken,
    });
  },

  getUserBuyListings: async () => {
    const { listings } = await bpTfApi.getUserListings();
    return listings.filter((listing) => listing.intent === EListingIntent.buy);
  },

  getUserSellListings: async () => {
    const { listings } = await bpTfApi.getUserListings();
    return listings.filter((listing) => listing.intent === EListingIntent.sell);
  },
};
