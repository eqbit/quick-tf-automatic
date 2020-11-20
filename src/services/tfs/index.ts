import { TCheckTradeOptions } from './types';
import { EListingIntent } from '../../types/enums';
import api from './api';
import { configData } from '../../api/config';
import { getSteamid64 } from '../../utils/get-steamid';
import { EItemQualities } from '../tf/constants';

export const checkTrade = async (
  {
    ourItems,
    theirItems,
    rawOffer,
    intent,
    currency,
  }: TCheckTradeOptions,
) => {
  if (intent === EListingIntent.buy) {
    if (theirItems.length > 1) {
      return;
    }

    const item = theirItems[0];

    api.reportTrade({
      accountSteamid: configData.steamid,
      name: item.name,
      effect: item.particleEffect || 'none',
      direction: intent,
      partnerSteamid: getSteamid64(rawOffer.partner),
      quality: EItemQualities[item.quality],
      itemid: item.id,
      keys: currency.keys,
      metal: currency.metal,
    });
  }

  if (intent === EListingIntent.sell) {
    if (ourItems.length > 1) {
      return;
    }

    const item = ourItems[0];

    api.reportTrade({
      accountSteamid: configData.steamid,
      name: item.name,
      effect: item.particleEffect || 'none',
      direction: intent,
      partnerSteamid: getSteamid64(rawOffer.partner),
      quality: EItemQualities[item.quality],
      itemid: item.id,
      keys: currency.keys,
      metal: currency.metal,
    });
  }
};
