import * as c from '../../../config.json';
import { TConfigFields } from './types';

const config = c as TConfigFields;

export const configData = {
  bptfAccessToken: config.bptfAccessToken,
  bptfApiKey: config.bptfApiKey,
  telegramApiToken: config.telegramApiToken,
};
