import * as SteamTotp from 'steam-totp';
import { ConfirmationType } from 'steamcommunity';
import { TTotpConstructorOptions } from './types';
import { Steam } from '../steam';
import { getNowInSeconds } from '../../utils/time';
import { CONFIRMATION_POLL_INTERVAL } from '../../constants';
import { logger } from '../logger';

export class Totp {
  protected secret = '';
  protected offerIds: Record<string, boolean> = {};
  protected steam: ReturnType<Steam['getCommunity']>;

  constructor({ steam, secret }: TTotpConstructorOptions) {
    this.steam = steam.getCommunity();
    this.secret = secret;
  }

  protected getTotpKey = (tag: string) =>
    SteamTotp.getConfirmationKey(this.secret, getNowInSeconds(), tag);

  protected accept = (confirmation) => {
    logger.log(`Accepting confirmation ${confirmation.id}`);

    const time = getNowInSeconds();
    confirmation.respond(time, this.getTotpKey('allow'), true, (err) => {
      if (err) {
        logger.error(`Error accepting confirmation ${confirmation.id}.`);
        return;
      }

      const { creator } = confirmation;
      const handledByAutomatic = confirmation.type === ConfirmationType.Trade
        && this.offerIds[creator];

      if (handledByAutomatic) {
        this.offerIds[creator] = null;
      }

      logger.log(`Confirmation ${confirmation.id} accepted`);
    });
  };

  public enable = () => {
    if (!this.secret) {
      logger.error('You must provide the identity_secret to activate automatic confirmations');
      return;
    }

    this.steam.on('confKeyNeeded', (tag, callback) => {
      callback(null, getNowInSeconds(), this.getTotpKey(tag));
    });

    this.steam.on('newConfirmation', (confirmation) => {
      this.accept(confirmation);
    });

    this.steam.startConfirmationChecker(CONFIRMATION_POLL_INTERVAL);
  };

  public check = () => {
    this.steam.checkConfirmations();
  };

  public addOffer = (id: string) => {
    this.offerIds[id] = true;
  };
}
