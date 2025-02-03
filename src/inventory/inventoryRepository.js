import { FailedGettingError } from '../errors/errorTypes/failedGettingError.js';
import { FAILED_GETTING, PLANTS, SQLERROR } from '../utils/textConstants.js';

export class InventoryRepository {
  constructor ({ mySQLConnection }) {
    this.mySQLConnection = mySQLConnection;
  }

  async getServerInventoryPlants () {
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `
        SELECT * FROM plants
        ORDER BY Name ASC;
        `
      );
      if (!rows) {
        return [];
      }
      return rows;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, PLANTS, error);
      }
      throw error;
    }
  }
}
