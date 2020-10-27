import { steam } from '../steam';
import { getSteamAccountDetails, getSteamGuardCode } from '../command-line-input';
import { configData, saveConfig } from '../config';

export const loginApi = {
  oAuthLogin: (steamguard: string, token: string) => {
    return steam.oAuthLogin(steamguard, token);
  },

  isLoggedIn: () => {
    return steam.isLoggedIn();
  },

  login: async () => {
    const accountDetails = await getSteamAccountDetails();
    return loginApi.newLogin(accountDetails);
  },

  newLogin: (accountDetails) => {
    return new Promise((resolve, reject) => {
      steam.login(accountDetails, (err, sessionID, cookies, steamguard, oAuthToken) => {
        if (err) {
          const errorCode = err.message;

          switch (errorCode) {
            case 'SteamGuard':
            case 'SteamGuardMobile': {
              const isMobile = errorCode === 'SteamGuardMobile';
              getSteamGuardCode().then(({ code }) => {
                console.log(errorCode);
                loginApi.newLogin({
                  ...accountDetails,
                  [isMobile ? 'twoFactorCode' : 'authCode']: code,
                }).then(resolve, reject);
              });
              break;
            }
            case 'HTTP error 500': loginApi.newLogin(accountDetails)
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
          console.log('Successfully logged into Steam!');
          resolve(cookies);
        });
      });
    });
  },
};
