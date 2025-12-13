import express from 'express';
import config from './config/config';

const app = express();
app.get('/api/v1', (req, res) => {
  res.send('welcome to our social media api');
});
app.listen(config.PORT, () => {
  console.log(`app is running at port ${config.PORT}`);
});
