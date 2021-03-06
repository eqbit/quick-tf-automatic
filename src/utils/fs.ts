import {
  writeFile, readFile as fsReadFile, existsSync, mkdirSync,
} from 'promise-fs';
import { dirname } from 'path';
import { COOKIES_PATH, POLLDATA_PATH } from '../constants';
import { TPollData } from '../services/trade-offer-manager/types';

export const saveFile = async (path: string, data: any) => {
  const dirName = dirname(path);
  if (!existsSync(dirName)) {
    mkdirSync(dirName, { recursive: true });
  }
  await writeFile(path, JSON.stringify(data, null));
};

export const readFile = async <T = any>(path: string) => {
  if (existsSync(path)) {
    const fileBuffer = await fsReadFile(path);
    return JSON.parse(fileBuffer.toString()) as T;
  }
  return null;
};

export const saveCookies = async (cookies: Array<string>) => {
  await saveFile(COOKIES_PATH, cookies);
};

export const getCookies = async () =>
  readFile<Array<string>>(COOKIES_PATH);

export const savePollData = async (pollData) => {
  await saveFile(POLLDATA_PATH, pollData);
};

export const getPollData = async () =>
  readFile<TPollData>(POLLDATA_PATH);
