import { IAPIAdapter } from "../core/interfaces/IAPIAdapter";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/**
 * Recipe API Adapter
 * Implements IAPIAdapter for TheMealDB API
 */
export class RecipeAPIAdapter extends IAPIAdapter {
  async search(query) {
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      const meals = data.meals || [];
      return meals.map((meal) => this.transform(meal));
    } catch (error) {
      console.error("Error searching recipes:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals ? this.transform(data.meals[0]) : null;
    } catch (error) {
      console.error("Error getting recipe by id:", error);
      return null;
    }
  }

  async getRandom(count = 6) {
    try {
      const promises = Array(count)
        .fill()
        .map(async () => {
          const response = await fetch(`${BASE_URL}/random.php`);
          const data = await response.json();
          return data.meals ? this.transform(data.meals[0]) : null;
        });
      const meals = await Promise.all(promises);
      return meals.filter((meal) => meal !== null);
    } catch (error) {
      console.error("Error getting random recipes:", error);
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  async filterByCategory(category) {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      const data = await response.json();
      const meals = data.meals || [];
      // Note: Filter endpoint returns limited data, need to fetch full details
      return meals.map((meal) => this.transform(meal));
    } catch (error) {
      console.error("Error filtering by category:", error);
      return [];
    }
  }

  transform(meal) {
    if (!meal) return null;

    // Extract ingredients from the meal object
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        const measureText = measure && measure.trim() ? `${measure.trim()} ` : "";
        ingredients.push(`${measureText}${ingredient.trim()}`);
      }
    }

    // Extract instructions
    const instructions = meal.strInstructions
      ? meal.strInstructions.split(/\r?\n/).filter((step) => step.trim())
      : [];

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: meal.strInstructions
        ? meal.strInstructions.substring(0, 120) + "..."
        : "Delicious meal from TheMealDB",
      image: meal.strMealThumb,
      cookTime: "30 minutes",
      servings: "4 servings",
      category: meal.strCategory || "Main Course",
      area: meal.strArea,
      ingredients,
      instructions,
      originalData: meal,
    };
  }
}
