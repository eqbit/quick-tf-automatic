import { bpTfApi } from './services/bptf/api';

bpTfApi.getUserSellListings().then((listings) => {
  console.log(listings[0]);
});
