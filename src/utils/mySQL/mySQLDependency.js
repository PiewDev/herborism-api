import { asClass, asValue } from 'awilix';
import { MySQLConnection } from './mySQLConnection.js';
import { DEFAULT_CONFIG } from './mySQLConfigs.js';

export const mySQLDependency = (container) => {
  container.register({
    mySQLConnection: asClass(MySQLConnection).scoped(),
    defaultConfig: asValue(DEFAULT_CONFIG)
  });
};
