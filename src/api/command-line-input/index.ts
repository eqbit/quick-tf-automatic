import { prompt } from 'prompts';
import 'colors';

export const getSteamGuardCode = async () => {
  const { code } = await prompt({
    type: 'text',
    name: 'code',
    message: 'Enter Steamguard code',
    validate: (input: string) => input.length >= 4,
  });

  return code;
};

export const getSteamAccountDetails = async () => {
  return prompt([
    {
      type: 'text',
      name: 'accountName',
      message: 'Steam login',
      validate: (input: string) => input.length >= 2,
    },
    {
      type: 'password',
      name: 'password',
      message: 'Steam password',
      validate: (input: string) => input.length >= 6,
    },
  ]);
};
