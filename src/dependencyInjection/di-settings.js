import { createContainer, InjectionMode } from 'awilix';
import { registerInventoryDependency } from '../inventory/inventoryDependencyInjection/registerInventoryDependency.js';
import { registerUserDependency } from '../users/userDependencyInjection/registerUserDependency.js';
import { mySQLDependency } from '../utils/mySQL/mySQLDependency.js';

export const container = createContainer({
  injectionMode: InjectionMode.PROXY
});

export function settings () {
  registerInventoryDependency(container);
  registerUserDependency(container);
  mySQLDependency(container);
};

settings();
