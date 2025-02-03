import dotenv from 'dotenv';
dotenv.config();

export const DEFAULT_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD || '123123123',
  database: process.env.DB_DATABASE || 'Herborism_api'
};
