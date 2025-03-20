import { FAILED_CREATE, SQLERROR, USERS, ALREADY_EXIST, DOES_NOT_EXIST, FAILED_GETTING_ERROR } from '../utils/textConstants.js';
import { AlreadyExistError } from '../errors/errorTypes/alreadyExistError.js';
import { FailedCreatingError } from '../errors/errorTypes/failedCreatingError.js';
import { DoesNotExistError } from '../errors/errorTypes/doesNotExistError.js';
import { FailedGettingError } from '../errors/errorTypes/failedGettingError.js';

export class UserRepository {
  constructor ({ mySQLConnection }) {
    this.mySQLConnection = mySQLConnection;
  }

  async create (input) {
    try {
      const { userName, password, role } = input;
      const rows = await this.mySQLConnection.executeQuery(
        'SELECT userName FROM users WHERE userName = (?);',
        [userName]
      );
      if (rows.length > 0) {
        throw new AlreadyExistError(ALREADY_EXIST, USERS);
      }

      await this.mySQLConnection.executeQuery(
        `
          INSERT INTO Users (userName, passwordHash, role)
          VALUES (?, ?, ?);
        `,
        [userName, password, role]
      );
      return { userName };
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedCreatingError(FAILED_CREATE, USERS, error);
      }
      throw error;
    }
  }

  async getBy (property) {
    const key = Object.keys(property)[0];
    const value = Object.values(property)[0];
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `SELECT * FROM users WHERE ${key} = ?;`,
        [value]
      );
      if (rows.length === 0) {
        throw new DoesNotExistError(DOES_NOT_EXIST, USERS);
      }
      return rows;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING_ERROR, USERS, error);
      }
      throw error;
    }
  }

  async exist (property) {
    try {
      const rows = await this.getBy(property);
      return rows.length > 0;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING_ERROR, USERS, error);
      }
      return false;
    }
  }
}
