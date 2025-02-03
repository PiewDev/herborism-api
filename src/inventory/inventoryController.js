import tryCatch from '../utils/tryCatch.js';

export class InventoryController {
  constructor ({ inventoryService }) {
    this.inventoryService = inventoryService;
    this.getServerInventory = this.getServerInventoryPlants.bind(this);
  }

  getServerInventoryPlants = tryCatch(async (req, res) => {
    const plants = await this.inventoryService.getServerInventoryPlants();
    res.status(200).json(plants);
  });
}
