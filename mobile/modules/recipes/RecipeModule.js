import { RecipeAPIAdapter } from "./RecipeAPIAdapter";
import { COLORS } from "../../constants/colors";

/**
 * Recipe Module Configuration
 */
export const RecipeModule = {
  id: "recipes",
  name: "Recipes",
  icon: "restaurant-outline",
  apiAdapter: new RecipeAPIAdapter(),

  // Card display configuration
  cardFields: [
    { key: "title", type: "title" },
    { key: "description", type: "description" },
    { key: "cookTime", type: "footer", icon: "time-outline" },
    { key: "servings", type: "footer", icon: "people-outline" },
  ],

  // Detail view configuration
  detailFields: [
    { key: "title", type: "title" },
    { key: "category", type: "meta", icon: "pricetag-outline", label: "Category" },
    { key: "area", type: "meta", icon: "location-outline", label: "Cuisine" },
    { key: "cookTime", type: "meta", icon: "time-outline", label: "Cook Time" },
    { key: "servings", type: "meta", icon: "people-outline", label: "Servings" },
    { key: "ingredients", type: "list", label: "Ingredients" },
    { key: "instructions", type: "steps", label: "Instructions" },
  ],

  // Module-specific colors (optional)
  colors: {
    primary: COLORS.primary,
    accent: "#FF6B6B",
  },

  // Schema for database storage
  schema: {
    id: "string",
    title: "string",
    description: "string",
    image: "string",
    cookTime: "string",
    servings: "string",
    category: "string",
    area: "string",
    ingredients: "array",
    instructions: "array",
  },
};
