import axios from 'axios';
import { logger } from '../../services/logger';

export const fetch = {

  get: async <T>(url: string, options?: object) => {
    const params = options ? Object.entries(options)
      .map(([key, param]) => `${key}=${encodeURIComponent(param)}`)
      .join('&') : '';

    try {
      const { data } = await axios.get<T>(`${url}${params ? `?${params}` : ''}`);
      return data;
    } catch (e) {
      logger.error(`Error trying GET from ${url}`, e.message);
    }
  },

  post: async <B = any, T = any>(url: string, body: B, config?: object) => {
    try {
      const { data } = await axios.post<T>(url, body, config);
      return data;
    } catch (e) {
      logger.error(`Error trying POST to ${url}`, e.message);
    }
  },

  delete: async (url: string, data?: any) => {
    try {
      return await axios({
        method: 'DELETE',
        url,
        data,
      }).then((r) => r.data);
    } catch (e) {
      logger.error(`Error trying DELETE to ${url}`, e.message);
    }
  },
};
