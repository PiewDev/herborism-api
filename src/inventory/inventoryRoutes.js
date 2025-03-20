import { Router } from 'express';
import { container } from '../dependencyInjection/di-settings.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authentication.js';
import { ADMIN } from '../utils/textConstants.js';

const InventoryController = container.cradle.inventoryController;

export const createInventoryRouter = () => {
  const inventoryRouter = Router();

  // inventory plants routes
  // Server
  inventoryRouter.get('/server', InventoryController.getServerElements);
  inventoryRouter.post('/server/plants', /* authenticateJWT,  authorizeRole([ADMIN]), */ InventoryController.addPlantToServer);
  inventoryRouter.post('/server/extracts', /* authenticateJWT,  authorizeRole([ADMIN]), */ InventoryController.addExtractToServer);
  // Users
  inventoryRouter.get('/users/:userName?', authenticateJWT, InventoryController.getUserElements);
  inventoryRouter.post('/users/:userName?', authenticateJWT, InventoryController.addElementToUser);
  inventoryRouter.delete('/users/:userName?', authenticateJWT, InventoryController.removeElementFromUser);

  // inventory potions routes
  // Server
  inventoryRouter.get('/server/potions', InventoryController.getServerPotions);
  inventoryRouter.post('/server/potions', /* authenticateJWT,  authorizeRole([ADMIN]), */ InventoryController.addPotionToServer);

  // Users
  inventoryRouter.get('/users/:userName?/potions', authenticateJWT, InventoryController.getUserPotions);
  inventoryRouter.post('/users/:userName?/potions', authenticateJWT, InventoryController.addPotionToUser);
  inventoryRouter.delete('/users/:userName?/potions', authenticateJWT, InventoryController.removePotionFromUser);

  return inventoryRouter;
};
