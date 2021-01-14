// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.NTBA_FIX_319 = 1;
// eslint-disable-next-line import/first
import * as TelegramBot from 'node-telegram-bot-api';

interface IConstructorOptions {
  botApiKey: string;
  channelName: string | number;
}

export class TelegramSender {
  protected botApiKey: string;
  protected channelName: string | number;
  protected bot: TelegramBot;

  constructor(options: IConstructorOptions) {
    this.botApiKey = options.botApiKey;
    this.channelName = options.channelName;
    this.bot = new TelegramBot(this.botApiKey);
  }

  public sendMessage(message: string) {
    try {
      this.bot.sendMessage(this.channelName, message, { disable_web_page_preview: true });
    } catch (err) {
      console.error('Error caught in sendMessage: ', err.message);
    }
  }
}
