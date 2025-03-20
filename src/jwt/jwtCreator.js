import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { SECRET_TOKEN_KEY } from '../../src/utils/textConstants.js';

dotenv.config();

const secret = process.env.SECRET_KEY || SECRET_TOKEN_KEY;
const tokenExpirationTimeSeconds = process.env.TOKEN_EXPIRATION_TIME_SECONDS || 3600;

export const jwtCreator = (payload) => {
  return jwt.sign(
    payload,
    secret,
    {
      expiresIn: tokenExpirationTimeSeconds * 1000
    }
  );
};
