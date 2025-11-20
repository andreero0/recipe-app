/**
 * Module Registry
 * Central registry for all content modules
 */
class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.activeModule = null;
  }

  /**
   * Register a new module
   * @param {Object} moduleConfig - Module configuration
   * @param {string} moduleConfig.id - Unique module identifier
   * @param {string} moduleConfig.name - Display name
   * @param {string} moduleConfig.icon - Ionicons icon name
   * @param {IAPIAdapter} moduleConfig.apiAdapter - API adapter instance
   * @param {Object} moduleConfig.schema - Data schema definition
   * @param {Array} moduleConfig.detailFields - Fields to show in detail view
   * @param {Array} moduleConfig.cardFields - Fields to show in card view
   * @param {Object} moduleConfig.colors - Module-specific colors (optional)
   */
  register(moduleConfig) {
    if (!moduleConfig.id) {
      throw new Error("Module must have an 'id'");
    }
    if (!moduleConfig.apiAdapter) {
      throw new Error("Module must have an 'apiAdapter'");
    }

    this.modules.set(moduleConfig.id, {
      id: moduleConfig.id,
      name: moduleConfig.name || moduleConfig.id,
      icon: moduleConfig.icon || "apps-outline",
      apiAdapter: moduleConfig.apiAdapter,
      schema: moduleConfig.schema || {},
      detailFields: moduleConfig.detailFields || [],
      cardFields: moduleConfig.cardFields || [],
      colors: moduleConfig.colors || {},
      customComponents: moduleConfig.customComponents || {},
    });
  }

  /**
   * Get a module by ID
   * @param {string} id - Module ID
   * @returns {Object|undefined} Module configuration
   */
  get(id) {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules
   * @returns {Array} Array of module configurations
   */
  getAll() {
    return Array.from(this.modules.values());
  }

  /**
   * Set the active module
   * @param {string} id - Module ID
   */
  setActive(id) {
    if (!this.modules.has(id)) {
      throw new Error(`Module '${id}' not registered`);
    }
    this.activeModule = id;
  }

  /**
   * Get the active module
   * @returns {Object|null} Active module configuration
   */
  getActive() {
    return this.activeModule ? this.modules.get(this.activeModule) : null;
  }

  /**
   * Check if a module exists
   * @param {string} id - Module ID
   * @returns {boolean}
   */
  has(id) {
    return this.modules.has(id);
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistry();
