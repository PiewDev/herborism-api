import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import tryCatch from './src/utils/tryCatch.js';
import { CORS_NOT_ALLOWED } from './src/utils/textConstants.js';

dotenv.config();

const app = express();

app.disable('x-powered-by');
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(CORS_NOT_ALLOWED));
  },
  credentials: true,
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.get(
  '/',
  tryCatch(async (req, res) => {
    res.status(200).send('<h1>HERBORISM</h1>');
  }));

const PORT = process.env.PORT || 4141;
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

export default app;
