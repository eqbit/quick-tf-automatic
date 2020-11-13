import * as SteamID from 'steamid';

type TPartner = {
  universe: number;
  type: number;
  instance: number;
  accountid: number;
};

export const getSteamid64 = (partner: TPartner) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const steamId = new SteamID();

  steamId.universe = partner.universe;
  steamId.type = partner.type;
  steamId.instance = partner.instance;
  steamId.accountid = partner.accountid;

  return steamId.getSteamID64();
};
