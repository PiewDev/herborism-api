import { FailedAddingError } from '../errors/errorTypes/failedAddingError.js';
import { FailedGettingError } from '../errors/errorTypes/failedGettingError.js';
import { FailedToDeleteError } from '../errors/errorTypes/failedToDeleteError.js';
import { FAILED_DELETE, FAILED_DELETING, FAILED_GETTING, INVENTORY, PLANTS, SQLERROR } from '../utils/textConstants.js';

export class InventoryRepository {
  constructor ({ mySQLConnection }) {
    this.mySQLConnection = mySQLConnection;
  }

  // Elements

  // Server

  async getServerElements () {
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `
        SELECT * FROM Elements
        ORDER BY name ASC;
        `
      );
      return rows;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, PLANTS, error);
      }
      throw error;
    }
  }

  async addPlantToServer (elements) {
    try {
      await this.mySQLConnection.executeTransaction(async (connection) => {
        for (const element of elements) {
          await this.mySQLConnection.executeQuery(
            `
            INSERT INTO Elements (name, description, type, baseTerrain, climate, temperature, rarity, light, momentOfDay, exceptTerrain)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              description = VALUES(description),
              type = VALUES(type),
              baseTerrain = VALUES(baseTerrain),
              climate = VALUES(climate),
              temperature = VALUES(temperature),
              rarity = VALUES(rarity),
              light = VALUES(light),
              momentOfDay = VALUES(momentOfDay),
              exceptTerrain = VALUES(exceptTerrain);
            `,
            [
              element.name,
              element.description,
              'plant',
              element.baseTerrain,
              element.climate,
              element.temperature,
              element.rarity,
              element.light,
              element.momentOfDay,
              element.exceptTerrain
            ],
            connection
          );
        }
      });
      return true;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedAddingError(FAILED_GETTING, PLANTS, error);
      }
      throw error;
    }
  }

  async addExtractToServer (elements) {
    try {
      await this.mySQLConnection.executeTransaction(async (connection) => {
        for (const element of elements) {
          await this.mySQLConnection
            .executeQuery(
              `
              INSERT INTO Elements (name, description, type)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE description = VALUES(description);
              `,
              [element.name, element.description, 'extract'],
              connection
            );
        }
      });
      return true;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedAddingError(FAILED_GETTING, PLANTS, error);
      }
      throw error;
    }
  }

  // Users

  async getUserElements (userName) {
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `
        SELECT Elements.name, Elements.description, Elements.type, user_Elements.quantity
        FROM user_Elements
        JOIN Elements ON user_Elements.Elements_name = Elements.name
        WHERE user_Elements.user_userName = (?)
        ORDER BY Elements.name ASC;
        `,
        [userName]
      );
      return rows;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, PLANTS, error);
      }
      throw error;
    }
  }

  async addElementToUser (userName, elementName, quantity, type) {
    try {
      if (type !== 'plant') {
        // si no es una planta, se trata de un extracto por lo tanto tengo que borrar la planta que se usa para ese extracto y agregar el extracto
        // en elementName viene el nombre del extracto por ejemplo "lavanda(extracto)", para borrar la planta tengo que sacar el nombre de la planta que es "lavanda"
        const plantName = elementName.split('(')[0];
        await this.mySQLConnection.executeTransaction(async (connection) => {
          const removed = await this.inventoryRepository.removeElementFromUser(userName, plantName, quantity, connection);
          if (!removed) {
            throw new FailedToDeleteError(FAILED_DELETE, PLANTS);
          }
          // si se puedo borrar la planta, agrego el extracto.
          await this.mySQLConnection.executeQuery(
            `
            INSERT INTO user_Elements (user_userName, Elements_name, quantity, type)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
            `,
            [userName, elementName, quantity, type]
          );
        });
      }
      // si es una planta la agrego y ya esta
      await this.mySQLConnection.executeQuery(
        `
        INSERT INTO user_Elements (user_userName, Elements_name, quantity, type)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
        `,
        [userName, elementName, quantity, type]
      );
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedAddingError(FAILED_GETTING, PLANTS, error);
      }
      throw error;
    }
  }

  async removeElementFromUser (userName, elementName, quantity, connection) {
    try {
      const result = await this.mySQLConnection.executeQuery(
        `
        UPDATE user_Elements
        SET quantity = ?
        WHERE user_userName = ?
        AND elements_name = ?;
        `,
        [quantity, userName, elementName], connection
      );
      return result.affectedRows > 0;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedToDeleteError(FAILED_DELETING, INVENTORY, error);
      }
      throw error;
    }
  }

  async deleteElement (userName, elementName, connection) {
    try {
      await this.mySQLConnection.executeQuery(
        `
        DELETE FROM user_Elements
        WHERE user_userName = ?
        AND Elements_name = ?;
        `,
        [userName, elementName], connection
      );
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedToDeleteError(FAILED_DELETING, INVENTORY, error);
      }
      throw error;
    }
  }

  async getQuantities (userName, elementsList) {
    try {
      const elementsNames = elementsList.map(item => item.elementName);
      const placeholders = elementsNames.map(() => '?').join(', ');
      const result = await this.mySQLConnection.executeQuery(
        `
        SELECT 
        Elements_name AS ElementName,
        quantity
        FROM user_Elements
        WHERE user_userName = ? AND Elements_name IN (${placeholders})
        `,
        [userName, ...elementsNames]
      );
      const resultMap = new Map(result.map(result => [result.elementName, result.quantity]));

      return elementsList.map(element => ({
        elementName: element.elementName,
        quantity: resultMap.get(element.elementName) || 0
      }));
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, INVENTORY, error);
      }
      throw error;
    }
  }

  // Potions
  // Server
  async getServerPotions () {
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `
        SELECT * FROM potions
        ORDER BY name ASC;
        `
      );
      return rows;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, INVENTORY, error);
      }
      throw error;
    }
  };

  async addPotionToServer (potionList) {
    try {
      await this.mySQLConnection.executeTransaction(async (connection) => {
        for (const potion of potionList) {
          await this.mySQLConnection.executeQuery(
            `
            INSERT INTO Potions (name, effect, recipe, duration, type, level)
            VALUES (?, ?, ?,?, ?, ?)
            ON DUPLICATE KEY UPDATE
              effect = VALUES(effect),
              recipe = VALUES(recipe),
              duration = VALUES(duration),
              type = VALUES(type),
              level = VALUES(level);
            `,
            [potion.name, potion.description, JSON.stringify(potion.recipe)],
            connection
          );
        }
      });
      return true;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedAddingError(FAILED_GETTING, INVENTORY, error);
      }
      throw error;
    }
  };

  async getPotionRecipe (potionName) {
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `
        SELECT recipe
        FROM Potions
        WHERE name = (?);
        `,
        [potionName]
      );

      if (rows.length === 0) {
        throw new Error('Potion not found');
      }

      return JSON.parse(rows[0].recipe);
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, INVENTORY, error);
      }
      throw error;
    }
  }

  // Users
  async getUserPotions (userName) {
    try {
      const rows = await this.mySQLConnection.executeQuery(
        `
        SELECT potions.name, potions.description, user_potions.quantity
        FROM user_potions
        JOIN potions ON user_potions.potion_name = potions.name
        WHERE user_potions.user_userName = (?)
        ORDER BY potions.name ASC;
        `,
        [userName]
      );
      return rows;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedGettingError(FAILED_GETTING, INVENTORY, error);
      }
      throw error;
    }
  }

  async addPotionToUser (userName, potionName, recipe) {
    const quantity = 1;
    try {
      await this.mySQLConnection.executeQuery(
        `
        INSERT INTO user_potions (user_userName, potion_name, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
        `,
        [userName, potionName, quantity]
      );
      return true;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedAddingError(FAILED_GETTING, INVENTORY, error);
      }
      throw error;
    }
  };

  removePotionFromUser = async (userName, potionName) => {
    const quantity = 1;
    try {
      await this.mySQLConnection.executeQuery(
        `
        UPDATE user_potions
        SET quantity = quantity - ?
        WHERE user_userName = ?
        AND potion_name = ?;
        `,
        [quantity, userName, potionName]
      );
      return true;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedToDeleteError(FAILED_DELETING, INVENTORY, error);
      }
      throw error;
    }
  };

  deletePotionFromUser = async (userName, potionName) => {
    try {
      await this.mySQLConnection.executeQuery(
        `
        DELETE FROM user_potions
        WHERE user_userName = ?
        AND potion_name = ?;
        `,
        [userName, potionName]
      );
      return true;
    } catch (error) {
      if (error.name === SQLERROR) {
        throw new FailedToDeleteError(FAILED_DELETING, INVENTORY, error);
      }
      throw error;
    }
  };

  // Apothecary
  // Users
}
