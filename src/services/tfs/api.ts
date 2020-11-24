import { fetch } from '../../api/fetch';
import { reportTradeEndpoint } from './endpoints';
import { TReportTradeOptions, TReportTradeResponse } from './types';

export class TfsApi {
  public reportTrade = async (options: TReportTradeOptions) => {
    const response = await fetch.post<
      TReportTradeOptions,
      TReportTradeResponse
      >(reportTradeEndpoint, options);

    if (response?.status === 'success') {
      console.log('Reported the trade');
    } else {
      console.log('Error reporting the trade');
    }
  };
}

export default new TfsApi();
