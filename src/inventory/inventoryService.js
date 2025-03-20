import { DoesNotExistError } from '../errors/errorTypes/doesNotExistError.js';
import { FailedAddingError } from '../errors/errorTypes/failedAddingError.js';
import { FailedGettingError } from '../errors/errorTypes/failedGettingError.js';
import { InvalidDataError } from '../errors/errorTypes/invalidDataError.js';
import { DOES_NOT_EXIST, FAILED_ADDING, FAILED_DELETING, FAILED_GETTING, INVALID_DATA, INVENTORY, USERS } from '../utils/textConstants.js';

export class InventoryService {
  constructor ({ inventoryRepository }) {
    this.inventoryRepository = inventoryRepository;
  }

  // Server
  getServerElements = async () => {
    const allElements = await this.inventoryRepository.getServerElements();
    if (allElements.length === 0) {
      throw new FailedGettingError(FAILED_GETTING, INVENTORY);
    }
    const plants = allElements.filter(element => element.type === 'plant');
    const extracts = allElements
      .filter(element => element.type === 'extract')
      .map(element => {
        return Object.fromEntries(
          Object.entries(element).filter(([_, value]) => value !== null)
        );
      });
    const filteredElements = [plants, extracts];
    return filteredElements;
  };

  addPlantToServer = async (elementList) => {
    if (!Array.isArray(elementList) || elementList.length === 0) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const isAdded = await this.inventoryRepository.addPlantToServer(elementList);
    if (!isAdded) {
      throw new FailedAddingError(FAILED_ADDING, INVENTORY);
    }
  };

  addExtractToServer = async (elementList) => {
    if (!Array.isArray(elementList) || elementList.length === 0) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const isAdded = await this.inventoryRepository.addExtractToServer(elementList);
    if (!isAdded) {
      throw new FailedAddingError(FAILED_ADDING, INVENTORY);
    }
  };

  // Users
  getUserElements = async (userName) => {
    if (!userName) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    };
    const userElements = await this.inventoryRepository.getUserElements(userName);
    return userElements;
  };

  addElementToUser = async (userName, elementName, type, quantity) => {
    if (!userName || !elementName || !type || !quantity) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    };
    const isAdded = await this.inventoryRepository.addElementToUser(userName, elementName, quantity, type);
    if (!isAdded) {
      throw new FailedAddingError(FAILED_ADDING, INVENTORY);
    }
    return isAdded;
  };

  removeElementFromUser = async (userName, list) => {
    if (!this.isValidRequest(userName, list)) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }

    if (!(await this.userRepository.exist(userName))) {
      throw new DoesNotExistError(DOES_NOT_EXIST, USERS);
    }

    const quantities = await this.inventoryRepository.getQuantities(userName, list);
    const pendingActions = this.buildPendingActions(userName, list, quantities);

    await Promise.all(pendingActions.map(action => action()));
  };

  // Potions

  // Server
  getServerPotions = async () => {
    const potions = await this.inventoryRepository.getServerPotions();
    if (potions.length === 0) {
      throw new FailedGettingError(FAILED_GETTING, INVENTORY);
    }
    return potions;
  };

  addPotionToServer = async (potionList) => {
    if (!Array.isArray(potionList) || potionList.length === 0 || !potionList.every(potion => potion.elementName && potion.quantity && potion.recipe)) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const isAdded = await this.inventoryRepository.addPotionToServer(potionList);
    if (!isAdded) {
      throw new FailedAddingError(FAILED_ADDING, INVENTORY);
    }
  };

  // Users
  getUserPotions = async (userName) => {
    if (!userName) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const potionsList = await this.inventoryRepository.getUserPotions(userName);
    return potionsList;
  };

  addPotionToUser = async (userName, potionName) => {
    if (!userName || !potionName) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const recipe = await this.inventoryRepository.getPotionRecipe(potionName);
    if (!recipe) {
      throw new DoesNotExistError(DOES_NOT_EXIST, INVENTORY);
    }

    const quantity = await this.inventoryRepository.getQuantities(userName, recipe);

    const hasEnoght = this.compareItems(quantity, recipe);
    if (!hasEnoght) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const isAdded = await this.inventoryRepository.addPotionToUser(userName, potionName, recipe);
    if (!isAdded) {
      throw new FailedAddingError(FAILED_ADDING, INVENTORY);
    }
    if (isAdded) {
      const isRemoved = await this.removeElementFromUser(userName, recipe);
      if (!isRemoved) {
        const rollBack = recipe.map(element => this.inventoryRepository.addElementToUser(userName, element.elementName, element.quantity, element.type));
        if (!rollBack) {
          throw new FailedAddingError(FAILED_ADDING, INVENTORY);
        }
      }
    }
    return isAdded;
  };

  removePotionFromUser = async (userName, potionName) => {
    if (!userName || !potionName) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }
    const userHas = await this.inventoryRepository.getUserPotions(userName);
    const potion = userHas.find(p => p.elementName === potionName);
    if (!potion.quantity || potion.quantity === 0) {
      throw new DoesNotExistError(DOES_NOT_EXIST, INVENTORY);
    }
    if (potion.quantity === 1) {
      const isDeleted = await this.inventoryRepository.deletePotionFromUser(userName, potionName);
      if (!isDeleted) {
        throw new FailedAddingError(FAILED_DELETING, INVENTORY);
      }
    }
    if (potion.quantity > 1) {
      const isUpdated = await this.inventoryRepository.removePotionFromUser(userName, potionName);
      if (!isUpdated) {
        throw new FailedAddingError(FAILED_DELETING, INVENTORY);
      }
    }
  };

  // Utils
  compareItems (itemsHas, itemsMust) {
    if (!Array.isArray(itemsMust)) {
      throw new InvalidDataError(INVALID_DATA, INVENTORY);
    }

    for (const reqItem of itemsMust) {
      const userItem = itemsHas.find(item => item.elementName === reqItem.elementName);

      if (userItem.quantity === undefined || userItem.quantity < reqItem.quantity) {
        return false;
      }
    }
    return true;
  }

  isValidRequest (userName, list) {
    return userName && Array.isArray(list) && list.length > 0 && list.every(item =>
      item.elementName && typeof item.quantity === 'number' && item.quantity > 0
    );
  }

  buildPendingActions (userName, list, quantities) {
    return list.reduce((actions, { elementName, quantity }) => {
      const userHasItem = quantities.find(q => q.elementName === elementName);

      if (!userHasItem || userHasItem.quantity < quantity) {
        throw new InvalidDataError(FAILED_DELETING, INVENTORY);
      }

      actions.push(userHasItem.quantity === quantity
        ? () => this.inventoryRepository.deleteElement(userName, elementName)
        : () => this.inventoryRepository.removeElementFromUser(userName, elementName, userHasItem.quantity - quantity)
      );

      return actions;
    }, []);
  }
}
