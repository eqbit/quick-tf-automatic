import * as c from '../../../config.json';
import { TConfigFields } from './types';
import { saveFile } from '../../utils/fs';

const config = c as TConfigFields;

export const configData = {
  bptfAccessToken: config.bptfAccessToken,
  bptfApiKey: config.bptfApiKey,
  telegramApiToken: config.telegramApiToken,
  steamid: config.steamid,
  steamguard: config.steamguard,
  oAuthToken: config.oAuthToken,
};

export const saveConfig = async (newConfig: Partial<TConfigFields>) => {
  await saveFile('./config.json', newConfig);
};
