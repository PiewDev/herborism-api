import mysql from 'mysql2/promise';
import { SQLError } from '../../errors/errorTypes/SQLError.js';

export class MySQLConnection {
  constructor ({ defaultConfig }) {
    this.defaultConfig = defaultConfig;
  }

  async executeQuery (query, parameters, externalConnection) {
    let localConnection;

    try {
      if (!externalConnection) {
        localConnection = await mysql.createConnection(this.defaultConfig);
        const [rows] = await localConnection.query(query, parameters);
        return rows;
      }
      const [rows] = await externalConnection.query(query, parameters);
      return rows;
    } catch (error) {
      throw new SQLError(error, query, parameters);
    } finally {
      // solo cierra la connecion creada por localConnection no la externalConnection recive como parametro
      if (localConnection) {
        await localConnection.end();
      }
    }
  }

  async executeTransaction (transactionFunction) {
    let connection;
    try {
      connection = await mysql.createConnection(this.defaultConfig);
      await connection.beginTransaction();
      const result = await transactionFunction(connection);
      await connection.commit();
      return result;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
