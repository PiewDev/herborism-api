import { container } from '../dependencyInjection/di-settings.js';
import { Router } from 'express';

const InventoryController = container.cradle.inventoryController;

export const createInventoryRouter = () => {
  const inventoryRouter = Router();

  inventoryRouter.get('/server', InventoryController.getServerInventoryPlants);

  return inventoryRouter;
};
