import { prompt } from '../../utils/prompt';
import 'colors';

export const getSteamGuardCode = async () => {
  return prompt({
    code: {
      description: 'Enter Steam Guard code'.green,
      type: 'string',
      required: true,
    },
  }, 'Invalid input') as Promise<{ code: string }>;
};

export const getSteamAccountDetails = async () => {
  return prompt({
    login: {
      required: true,
      type: 'string',
      description: 'Steam login',
      default: '',
    },
    password: {
      required: true,
      hidden: true,
      replace: '*',
      type: 'string',
      description: 'Steam password',
      message: 'hidden',
    },
  }).then((response: Record<string, string>) => ({
    accountName: response.login.toLowerCase(),
    password: response.password,
  })) as Promise<Record<'accountName' | 'password', string>>;
};
