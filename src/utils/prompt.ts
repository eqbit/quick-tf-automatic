import * as rawPrompt from 'prompt';

type TProperties = {
  [name: string] : {
    pattern?: RegExp;
    message?: string;
    required?: boolean;
    hidden?: boolean;
    description?: string;
    type?: 'string' | 'number';
    replace?: '*';
    default?: string | number;
  }
};

export const prompt = (
  properties: TProperties,
  errorMessage?: string,
): Promise<Record<string, string | number>> => {
  return new Promise((resolve, reject) => {
    rawPrompt.start();
    rawPrompt.get({ properties }, (error, result) => {
      if (error) {
        if (errorMessage) {
          console.error(errorMessage);
        }
        reject(error);
      }

      resolve(result);
    });
  });
};
