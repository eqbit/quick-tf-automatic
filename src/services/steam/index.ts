import * as SteamCommunity from 'steamcommunity';
import { configData, saveConfig } from '../../api/config';
import { getSteamAccountDetails, getSteamGuardCode } from '../../api/command-line-input';
import { TIsLoggedInResponse } from './types';
import { saveCookies } from '../../utils/fs';

export class Steam {
  private steam = new SteamCommunity();

  private isLoggedIn(): Promise<TIsLoggedInResponse> {
    return new Promise((resolve) => {
      this.steam.loggedIn((error, loggedIn) => {
        resolve({
          success: loggedIn,
          error,
        });
      });
    });
  }

  private oAuthLogin(steamguard: string, token: string): Promise<Array<string>> {
    return new Promise((resolve) => {
      this.steam.oAuthLogin(steamguard, token, (error, _, cookies) => {
        if (error) {
          console.log(error);
        }

        resolve(cookies);
      });
    });
  }

  private newLogin(accountDetails): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      this.steam.login(accountDetails, (err, sessionID, cookies, steamguard, oAuthToken) => {
        if (err) {
          const errorCode = err.message;

          switch (errorCode) {
            case 'SteamGuard':
            case 'SteamGuardMobile': {
              const isMobile = errorCode === 'SteamGuardMobile';
              getSteamGuardCode().then(({ code }) => {
                this.newLogin({
                  ...accountDetails,
                  [isMobile ? 'twoFactorCode' : 'authCode']: code,
                }).then(resolve, reject);
              });
              break;
            }
            case 'HTTP error 500': this.newLogin(accountDetails)
              .then(resolve, reject);
              break;
            default:
              console.error(`Cannot  login to Steam: ${errorCode}`);
          }
          return;
        }

        saveConfig({
          ...configData,
          steamguard,
          oAuthToken,
        }).then(() => {
          resolve(cookies);
        });
      });
    });
  }

  private setCookies(cookies: Array<string>) {
    this.steam.setCookies(cookies);
  }

  public async init() {
    const { steamguard, oAuthToken } = configData;

    try {
      const cookies = oAuthToken && steamguard
        ? await this.oAuthLogin(steamguard, oAuthToken)
        : await this.newLogin(await getSteamAccountDetails());

      await saveCookies(cookies);

      this.setCookies(cookies);
    } catch (e) {
      console.log(e.message);
    }

    await this.confirmLogin();
  }

  private async confirmLogin() {
    const response = await this.isLoggedIn();
    if (response.success) {
      console.log('Successfully logged to Steam');
    } else {
      console.log('Failed login to Steam: ', response.error);
    }
  }

  public getCommunity() {
    return this.steam;
  }
}
