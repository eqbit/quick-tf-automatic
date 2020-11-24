import 'colors';

export class Logger {
  public log = (...args) => {
    console.log('info'.green, ...args);
  };

  public error = (...args) => {
    console.log('error'.red, ...args);
  };
}

export const logger = new Logger();
