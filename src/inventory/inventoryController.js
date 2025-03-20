import { ADD_SUCCESS, REMOVE_SUCCESS } from '../utils/textConstants.js';
import tryCatch from '../utils/tryCatch.js';

export class InventoryController {
  constructor ({ inventoryService }) {
    this.inventoryService = inventoryService;
    // Plants / Extracts

    this.getServerElements = this.getServerElements.bind(this);
    this.addPlantToServer = this.addPlantToServer.bind(this);
    this.addExtractToServer = this.addExtractToServer.bind(this);
    // Users

    this.getUserElements = this.getUserElements.bind(this);
    this.addElementToUser = this.addElementToUser.bind(this);
    this.removeElementFromUser = this.removeElementFromUser.bind(this);
    // Potions

    this.getServerPotions = this.getServerPotions.bind(this);
    this.getUserPotions = this.getUserPotions.bind(this);
    this.addPotionToUser = this.addPotionToUser.bind(this);
    this.removePotionFromUser = this.removePotionFromUser.bind(this);
  }

  // Elements

  // Server
  getServerElements = tryCatch(async (req, res) => {
    const elements = await this.inventoryService.getServerElements();
    res.status(200).json(elements);
  });

  addPlantToServer = tryCatch(async (req, res) => {
    const elementList = req.body;
    await this.inventoryService.addPlantToServer(elementList);
    res.status(200).json(ADD_SUCCESS);
  });

  addExtractToServer = tryCatch(async (req, res) => {
    const elementList = req.body;
    await this.inventoryService.addExtractToServer(elementList);
    res.status(200).json(ADD_SUCCESS);
  });

  // Users
  getUserElements = tryCatch(async (req, res) => {
    const { userName } = req.params;
    const plants = await this.inventoryService.getUserElements(userName);
    res.status(200).json(plants);
  });

  addElementToUser = tryCatch(async (req, res) => {
    const { userName } = req.params;
    const { elementName, quantity } = req.body;
    const elements = await this.inventoryService.addElementToUser(userName, elementName, quantity);
    res.status(200).json(elements);
  });

  removeElementFromUser = tryCatch(async (req, res) => {
    const { userName } = req.params;
    const { list } = req.body;
    await this.inventoryService.removeElementFromUser(userName, list);
    res.status(200).json(REMOVE_SUCCESS);
  });

  // Potions
  // Server
  getServerPotions = tryCatch(async (req, res) => {
    const potions = await this.inventoryService.getServerPotions();
    res.status(200).json(potions);
  });

  addPotionToServer = tryCatch(async (req, res) => {
    const potionList = req.body;
    await this.inventoryService.addPotionToServer(potionList);
    res.status(200).json(ADD_SUCCESS);
  });

  // Users
  getUserPotions = tryCatch(async (req, res) => {
    const { userName } = req.params;
    const potionsList = await this.inventoryService.getUserPotions(userName);
    res.status(200).json(potionsList);
  });

  addPotionToUser = tryCatch(async (req, res) => {
    const { userName } = req.params;
    const { potionName } = req.body;
    await this.inventoryService.addPotionToUser(userName, potionName);
    res.status(200).json(ADD_SUCCESS);
  });

  removePotionFromUser = tryCatch(async (req, res) => {
    const { userName } = req.params;
    const potionName = req.body;
    await this.inventoryService.removePotionFromUser(userName, potionName);
    res.status(200).json(REMOVE_SUCCESS);
  });
}
