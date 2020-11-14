import { Steam } from '../steam';

export type TTotpConstructorOptions = {
  steam: Steam;
  secret: string;
};
