import { SQLERROR } from '../../utils/textConstants.js';

export class SQLError extends Error {
  constructor (error, query, parameters) {
    super(error.message);
    this.name = SQLERROR;
    this.stack = error.stack;
    this.query = query;
    this.parameters = parameters;
  }
}
