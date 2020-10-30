import { TTfItem } from '../../types';
import { EItemDefindexes, EItemQualities } from '../../constants';

export const isKey = (item: TTfItem) => {
  if (
    item.quality === EItemQualities.Unique
    && item.name === 'Mann Co. Supply Crate Key'
    && item.defindex === EItemDefindexes.key
  ) {
    return true;
  }
};

export const isScrap = (item: TTfItem) => {
  if (
    item.quality === EItemQualities.Unique
    && item.name === 'Scrap Metal'
    && item.defindex === EItemDefindexes.scrap
  ) {
    return true;
  }
};

export const isRec = (item: TTfItem) => {
  if (
    item.quality === EItemQualities.Unique
    && item.name === 'Reclaimed Metal'
    && item.defindex === EItemDefindexes.rec
  ) {
    return true;
  }
};

export const isRef = (item: TTfItem) => {
  if (
    item.quality === EItemQualities.Unique
    && item.name === 'Refined Metal'
    && item.defindex === EItemDefindexes.ref
  ) {
    return true;
  }
};

export const addScrap = (metal: number) => {
  const integerPart = Math.floor(metal);
  const decimalPart = Math.floor(metal * 100 - integerPart * 100) / 100;

  switch (decimalPart) {
    case 0.11: return Math.floor(integerPart * 100 + 22) / 100;
    case 0.22: return Math.floor(integerPart * 100 + 33) / 100;
    case 0.33: return Math.floor(integerPart * 100 + 44) / 100;
    case 0.44: return Math.floor(integerPart * 100 + 55) / 100;
    case 0.55: return Math.floor(integerPart * 100 + 66) / 100;
    case 0.66: return Math.floor(integerPart * 100 + 77) / 100;
    case 0.77: return Math.floor(integerPart * 100 + 88) / 100;
    case 0.88: return integerPart + 1;
    default: return Math.floor(integerPart * 100 + 11) / 100;
  }
};

export const addRec = (metal: number) => {
  const integerPart = Math.floor(metal);
  const decimalPart = Math.floor(metal * 100 - integerPart * 100) / 100;

  switch (decimalPart) {
    case 0.11: return Math.floor(integerPart * 100 + 44) / 100;
    case 0.22: return Math.floor(integerPart * 100 + 55) / 100;
    case 0.33: return Math.floor(integerPart * 100 + 66) / 100;
    case 0.44: return Math.floor(integerPart * 100 + 77) / 100;
    case 0.55: return Math.floor(integerPart * 100 + 88) / 100;
    case 0.66: return Math.floor(integerPart * 100 + 100) / 100;
    case 0.77: return Math.floor(integerPart * 100 + 111) / 100;
    case 0.88: return Math.floor(integerPart * 100 + 122) / 100;
    default: return Math.floor(integerPart * 100 + 33) / 100;
  }
};

export const isCurrency = (item: TTfItem) => {
  return isKey(item) || isScrap(item) || isRec(item) || isRef(item);
};
