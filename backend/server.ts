import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/db.ts';
import app from './app.ts';

const port = process.env.PORT || 5000;

connectDB();

app.listen(port, () => {
  console.log(`vipshop-ecommerce server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
