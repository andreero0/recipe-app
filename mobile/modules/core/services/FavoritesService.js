import { API_URL } from "../../../constants/api";

/**
 * Generic Favorites Service
 * Handles favorites for any module type
 */
export class FavoritesService {
  /**
   * Add item to favorites
   * @param {string} userId - User ID
   * @param {string} moduleType - Module type (recipes, movies, books, etc.)
   * @param {Object} item - Item to favorite
   * @returns {Promise<Object>} Created favorite
   */
  static async add(userId, moduleType, item) {
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          moduleType,
          itemId: item.id,
          data: JSON.stringify(item), // Store full item data as JSON
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  /**
   * Remove item from favorites
   * @param {string} userId - User ID
   * @param {string} moduleType - Module type
   * @param {string|number} itemId - Item ID
   * @returns {Promise<Object>} Result
   */
  static async remove(userId, moduleType, itemId) {
    try {
      const response = await fetch(`${API_URL}/favorites/${userId}/${moduleType}/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  }

  /**
   * Get all favorites for a user and module type
   * @param {string} userId - User ID
   * @param {string} moduleType - Module type
   * @returns {Promise<Array>} Array of favorites
   */
  static async getAll(userId, moduleType) {
    try {
      const response = await fetch(`${API_URL}/favorites/${userId}/${moduleType}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const favorites = await response.json();

      // Parse the JSON data field back to objects
      return favorites.map((fav) => ({
        ...fav,
        data: JSON.parse(fav.data),
      }));
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  }

  /**
   * Check if item is favorited
   * @param {string} userId - User ID
   * @param {string} moduleType - Module type
   * @param {string|number} itemId - Item ID
   * @param {Array} favorites - Current favorites array
   * @returns {boolean}
   */
  static isFavorited(userId, moduleType, itemId, favorites) {
    return favorites.some(
      (fav) => fav.itemId === String(itemId) && fav.moduleType === moduleType
    );
  }

  /**
   * Toggle favorite status
   * @param {string} userId - User ID
   * @param {string} moduleType - Module type
   * @param {Object} item - Item to toggle
   * @param {Array} favorites - Current favorites array
   * @returns {Promise<Object>} Result with action taken
   */
  static async toggle(userId, moduleType, item, favorites) {
    const isFavorited = this.isFavorited(userId, moduleType, item.id, favorites);

    if (isFavorited) {
      await this.remove(userId, moduleType, item.id);
      return { action: "removed", item };
    } else {
      await this.add(userId, moduleType, item);
      return { action: "added", item };
    }
  }
}
