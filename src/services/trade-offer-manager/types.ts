export type TEconItem = {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: number;
  missing: boolean;
  est_usd: string;
  icon_url: string;
  icn_url_large: string;
  icon_drag_url: string;
  name: string;
  market_hash_name: string;
  market_name: string;
  name_color: string;
  background_color: string;
  type: string;
  tradable: boolean;
  marketable: boolean;
  commodity: boolean;
  market_tradable_restriction: number;
  market_marketable_restriction: number;
  fraudwarnings: Array<unknown>;
  descriptions: Array<{
    type: string;
    value: string;
    color: string;
    app_data: string;
  }>;
  actions: Array<{
    name: string;
    link: string;
  }>;
  market_actions: Array<{
    name: string;
    link: string;
  }>;
  tags: Array<{
    internal_name: string;
    name: string;
    category: string;
    category_name: string;
    localized_tag_name: string;
    color: string;
    localized_category_name: string;

  }>;
  app_data: {
    def_index: string;
    quality: string;
    slot: string;
    filter_data: {
      [key: string]: {
        element_ids: Array<unknown>
      };
    };
    player_class_ids: Record<string, string>,
    highlight_color: string;
  }
  ;
  id: string;
  owner_descriptions: Array<unknown>;
  owner_actions: Array<unknown>;
};

export type TTradeOffer = {
  partner: {
    universe: number;
    type: number;
    instance: number;
    accountid: number
  };
  id: string;
  message: string;
  state: number;
  itemsToGive: Array<TEconItem>;
  itemsToReceive: Array<TEconItem>;
  isOurOffer: boolean;
  created: Date;
  updated: Date;
  expires: Date;
  tradeId: unknown;
  fromRealTimeTrade: boolean;
  confirmationMethod: number;
  escrowEnds: unknown;
  rawJson: string;
};

export type TPollData = {
  sent: Record<string, number>;
  received: Record<string, number>;
  timestamps: Record<string, number>;
  offerSince: number;
};
