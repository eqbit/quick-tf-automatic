import { steam } from './api/steam';

steam.init().then(() => {
  console.log('Success');
});
