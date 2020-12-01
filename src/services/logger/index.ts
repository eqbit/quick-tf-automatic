import 'colors';

export class Logger {
  protected getTime = () =>
    new Date().toLocaleTimeString();

  public log = (...args) => {
    console.log(`[${this.getTime()}]`, '[log]'.green, ...args);
  };

  public info = (...args) => {
    console.log(`[${this.getTime()}]`, '[info]'.blue, ...args);
  };

  public error = (...args) => {
    console.log(`[${this.getTime()}]`, '[error]'.red, ...args);
  };

  public title = (title: string) => {
    console.log('');
    console.log(`[${this.getTime()}]`, `${title}`.cyan);
    console.log('');
  };
}

export const logger = new Logger();
