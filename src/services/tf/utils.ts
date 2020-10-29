import { TEconItem } from '../trade-offer-manager/types';
import { TTfItem } from './types';

export const getParticleEffect = (rawItem: TEconItem) => {
  const particleDescription = rawItem.descriptions
    .find((item) => item.value[0] === '\u2605');

  if (!particleDescription) {
    return;
  }

  return particleDescription.value.slice(18);
};

export const convertToTfItem = (rawItem: TEconItem): TTfItem => {
  try {
    return {
      id: rawItem.id,
      name: rawItem.market_hash_name,
      quality: rawItem.app_data.quality || '0',
      slot: rawItem.app_data.slot,
      defindex: rawItem.app_data.def_index,
      particleEffect: getParticleEffect(rawItem),
      isMarketable: rawItem.marketable,
    };
  } catch (error) {
    return null;
  }
};
