import { fetch } from '../../api/fetch';
import { reportTradeEndpoint } from './endpoints';
import { TReportTradeOptions, TReportTradeResponse } from './types';
import { logger } from '../logger';

export class TfsApi {
  public reportTrade = async (options: TReportTradeOptions) => {
    const response = await fetch.post<
      TReportTradeOptions,
      TReportTradeResponse
      >(reportTradeEndpoint, options);

    if (response?.status === 'success') {
      logger.log('Reported the trade');
    } else {
      logger.error('Error reporting the trade');
    }
  };
}

export default new TfsApi();
