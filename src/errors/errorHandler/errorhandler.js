import { INTERNAL_SERVER_ERROR } from '../../utils/textConstants.js';
import { errors } from './errorDictionary.js';
import { environment } from './config.js';

const isDevelopmentOrTest = environment === 'development' || 'test';

export const errorHandler = (error, req, res, next) => {
  const statusCode = errors[error.name] || 500;
  if (isDevelopmentOrTest) {
    return res.status(statusCode).json({ error, stack: error.stack, message: error.message });
  }
  const message = statusCode >= 500 ? INTERNAL_SERVER_ERROR : error.message;
  return res.status(statusCode).json({ ...error, message });
};
