/**
 * Module Initialization
 * Register all available modules here
 */
import { moduleRegistry } from "./core/ModuleRegistry";
import { RecipeModule } from "./recipes/RecipeModule";
import { MovieModule } from "./movies/MovieModule";
import { BookModule } from "./books/BookModule";

/**
 * Initialize all modules
 * Call this function at app startup
 */
export function initializeModules() {
  // Register all modules
  moduleRegistry.register(RecipeModule);
  moduleRegistry.register(MovieModule);
  moduleRegistry.register(BookModule);

  // Set default active module
  moduleRegistry.setActive("recipes");

  console.log("Modules initialized:", moduleRegistry.getAll().map((m) => m.name));
}

/**
 * Get the module registry singleton
 */
export { moduleRegistry };

/**
 * Export individual modules for direct access if needed
 */
export { RecipeModule, MovieModule, BookModule };
