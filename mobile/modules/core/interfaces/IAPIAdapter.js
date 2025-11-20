/**
 * Interface for API Adapters
 * All module API adapters should implement these methods
 */
export class IAPIAdapter {
  /**
   * Search for items by query string
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of items
   */
  async search(query) {
    throw new Error("Method 'search' must be implemented");
  }

  /**
   * Get item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise<Object|null>} Item object or null
   */
  async getById(id) {
    throw new Error("Method 'getById' must be implemented");
  }

  /**
   * Get random items
   * @param {number} count - Number of items to fetch
   * @returns {Promise<Array>} Array of random items
   */
  async getRandom(count = 6) {
    throw new Error("Method 'getRandom' must be implemented");
  }

  /**
   * Get available categories/filters
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    throw new Error("Method 'getCategories' must be implemented");
  }

  /**
   * Filter items by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of filtered items
   */
  async filterByCategory(category) {
    throw new Error("Method 'filterByCategory' must be implemented");
  }

  /**
   * Transform external API data to app format
   * @param {Object} data - Raw API data
   * @returns {Object} Transformed data
   */
  transform(data) {
    throw new Error("Method 'transform' must be implemented");
  }
}
