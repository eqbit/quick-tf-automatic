import * as config from '../../../config.json';
import { TConfigFields } from './types';
import { saveFile } from '../../utils/fs';

export const configData: TConfigFields = {
  bptfAccessToken: config.bptfAccessToken,
  bptfApiKey: config.bptfApiKey,
  telegramApiToken: config.telegramApiToken,
  steamid: config.steamid,
  steamguard: config.steamguard,
  oAuthToken: config.oAuthToken,
  telegramNotificationChannel: config.telegramNotificationChannel,
};

export const saveConfig = async (newConfig: Partial<TConfigFields>) => {
  await saveFile('./config.json', newConfig);
};
