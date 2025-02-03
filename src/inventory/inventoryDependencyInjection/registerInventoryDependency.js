import { asClass } from 'awilix';
import { InventoryController } from '../inventoryController.js';
import { InventoryService } from '../inventoryService.js';
import { InventoryRepository } from '../inventoryRepository.js';

export const registerInventoryDependency = (container) => {
  container.register({
    inventoryController: asClass(InventoryController).scoped(),
    inventoryService: asClass(InventoryService).scoped(),
    inventoryRepository: asClass(InventoryRepository).scoped()
  });
};
