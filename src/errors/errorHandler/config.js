import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  environment: process.env.NODE_ENV || 'development'
};
