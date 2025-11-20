/**
 * Optimized Module System - All modules initialized from centralized config
 */
import { moduleRegistry } from "./core/ModuleRegistry";
import { createModule } from "./core/ModuleFactory";
import { ALL_MODULES_CONFIG } from "./AllModulesConfig";

// Cache for lazy-loaded modules
const moduleCache = new Map();

/**
 * Initialize all modules efficiently
 * Uses factory pattern for minimal code duplication
 */
export function initializeModules(modulesToLoad = null) {
  const startTime = performance.now();

  // Load specific modules or all modules
  const configs = modulesToLoad
    ? Object.entries(ALL_MODULES_CONFIG).filter(([id]) => modulesToLoad.includes(id))
    : Object.entries(ALL_MODULES_CONFIG);

  let loadedCount = 0;
  for (const [id, config] of configs) {
    try {
      // Check cache first
      if (moduleCache.has(id)) {
        moduleRegistry.register(moduleCache.get(id));
      } else {
        const module = createModule(config);
        moduleCache.set(id, module);
        moduleRegistry.register(module);
      }
      loadedCount++;
    } catch (error) {
      console.warn(`Failed to load module '${id}':`, error.message);
    }
  }

  // Set default active module
  if (!moduleRegistry.getActive()) {
    moduleRegistry.setActive("recipes");
  }

  const endTime = performance.now();
  console.log(
    `✅ Initialized ${loadedCount}/${configs.length} modules in ${(endTime - startTime).toFixed(2)}ms`
  );
  console.log("📦 Available modules:", moduleRegistry.getAll().map((m) => m.name).join(", "));

  return {
    loaded: loadedCount,
    total: configs.length,
    duration: endTime - startTime,
  };
}

/**
 * Lazy load a specific module
 */
export async function loadModule(moduleId) {
  if (moduleRegistry.has(moduleId)) {
    return moduleRegistry.get(moduleId);
  }

  const config = ALL_MODULES_CONFIG[moduleId];
  if (!config) {
    throw new Error(`Module '${moduleId}' not found`);
  }

  const module = createModule(config);
  moduleCache.set(moduleId, module);
  moduleRegistry.register(module);

  return module;
}

/**
 * Unified search across all active modules
 */
export async function searchAllModules(query, options = {}) {
  const { modules = null, limit = 5 } = options;

  const modulesToSearch = modules
    ? modules.map((id) => moduleRegistry.get(id)).filter(Boolean)
    : moduleRegistry.getAll();

  const searchPromises = modulesToSearch.map(async (module) => {
    try {
      const results = await module.apiAdapter.search(query);
      return {
        moduleId: module.id,
        moduleName: module.name,
        results: results.slice(0, limit),
        count: results.length,
      };
    } catch (error) {
      console.error(`Search failed for module '${module.id}':`, error);
      return {
        moduleId: module.id,
        moduleName: module.name,
        results: [],
        count: 0,
        error: error.message,
      };
    }
  });

  const searchResults = await Promise.allSettled(searchPromises);

  return searchResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((moduleResult) => moduleResult.count > 0);
}

/**
 * Get aggregated favorites across all modules
 */
export async function getAllFavorites(userId) {
  const { FavoritesService } = await import("./core/services/FavoritesService");
  const modules = moduleRegistry.getAll();

  const favoritePromises = modules.map(async (module) => {
    const favorites = await FavoritesService.getAll(userId, module.id);
    return {
      moduleId: module.id,
      moduleName: module.name,
      favorites,
      count: favorites.length,
    };
  });

  const results = await Promise.allSettled(favoritePromises);

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((r) => r.count > 0);
}

/**
 * Get module statistics
 */
export function getModuleStats() {
  const modules = moduleRegistry.getAll();
  return {
    totalModules: modules.length,
    activeModule: moduleRegistry.getActive()?.name || "None",
    availableCategories: modules.reduce((sum, m) => {
      return sum + (Array.isArray(m.apiAdapter.categories) ? m.apiAdapter.categories.length : 0);
    }, 0),
    modules: modules.map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
    })),
  };
}

// Export core components
export { moduleRegistry };
export { ALL_MODULES_CONFIG };

// Export individual module loaders (lazy loading)
export const loadRecipes = () => loadModule("recipes");
export const loadMovies = () => loadModule("movies");
export const loadBooks = () => loadModule("books");
export const loadPodcasts = () => loadModule("podcasts");
export const loadMusic = () => loadModule("music");
export const loadWorkouts = () => loadModule("workouts");
export const loadGames = () => loadModule("games");
export const loadTravel = () => loadModule("travel");
export const loadEvents = () => loadModule("events");
