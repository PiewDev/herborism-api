export class InventoryService {
  constructor ({ inventoryRepository }) {
    this.inventoryRepository = inventoryRepository;
  }

  getServerInventoryPlants = async () => {
    const allPlants = await this.inventoryRepository.getServerInventoryPlants();
    return allPlants;
  };
}
