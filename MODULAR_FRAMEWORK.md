# Modular Content Framework

## Overview

This app now features a **modular content framework** that allows you to easily plug in different content types (recipes, movies, books, podcasts, etc.) with minimal code duplication.

The framework provides:
- **Generic API adapters** for connecting to any external API
- **Reusable UI components** (ContentCard, DetailView)
- **Unified favorites system** that works across all content types
- **Module registry** for managing multiple content modules
- **Configuration-driven** architecture for easy customization

## Architecture

```
mobile/
├── modules/
│   ├── core/                      # Core framework
│   │   ├── interfaces/
│   │   │   └── IAPIAdapter.js    # API adapter interface
│   │   ├── components/
│   │   │   ├── ContentCard.jsx   # Generic card component
│   │   │   └── DetailView.jsx    # Generic detail view
│   │   ├── services/
│   │   │   └── FavoritesService.js # Generic favorites service
│   │   └── ModuleRegistry.js      # Module registry
│   ├── recipes/                   # Recipe module
│   │   ├── RecipeModule.js
│   │   └── RecipeAPIAdapter.js
│   ├── movies/                    # Movie module
│   │   ├── MovieModule.js
│   │   └── MovieAPIAdapter.js
│   ├── books/                     # Book module
│   │   ├── BookModule.js
│   │   └── BookAPIAdapter.js
│   └── index.js                   # Module initialization
```

## Current Modules

### 1. Recipes (TheMealDB API)
- Browse and search recipes
- View ingredients and cooking instructions
- Save favorite recipes
- Filter by category and cuisine

### 2. Movies (TMDB API)
- Discover movies
- View ratings, release dates, and descriptions
- Track watchlist
- Filter by genre
- **Note**: Requires TMDB API key

### 3. Books (Google Books API)
- Search books
- View author, publisher, and descriptions
- Reading list management
- Filter by genre/category

## How to Add a New Module

Adding a new content type is simple! Follow these steps:

### Step 1: Create API Adapter

Create a new file `modules/[module-name]/[ModuleName]APIAdapter.js`:

```javascript
import { IAPIAdapter } from "../core/interfaces/IAPIAdapter";

export class YourModuleAPIAdapter extends IAPIAdapter {
  async search(query) {
    // Implement search
  }

  async getById(id) {
    // Implement get by ID
  }

  async getRandom(count = 6) {
    // Implement random items
  }

  async getCategories() {
    // Implement get categories
  }

  async filterByCategory(category) {
    // Implement filter by category
  }

  transform(data) {
    // Transform external API data to app format
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      image: data.imageUrl,
      // ... other fields
    };
  }
}
```

### Step 2: Create Module Configuration

Create `modules/[module-name]/[ModuleName]Module.js`:

```javascript
import { YourModuleAPIAdapter } from "./YourModuleAPIAdapter";

export const YourModule = {
  id: "your-module-id",           // Unique ID
  name: "Your Module Name",        // Display name
  icon: "ionicon-name",            // Ionicons icon name
  apiAdapter: new YourModuleAPIAdapter(),

  // Define how items appear in cards
  cardFields: [
    { key: "title", type: "title" },
    { key: "description", type: "description" },
    { key: "metadata1", type: "footer", icon: "icon-name" },
  ],

  // Define how items appear in detail view
  detailFields: [
    { key: "title", type: "title" },
    { key: "description", type: "text" },
    { key: "metadata1", type: "meta", icon: "icon-name", label: "Label" },
    { key: "listData", type: "list", label: "List Items" },
    { key: "steps", type: "steps", label: "Steps" },
  ],

  // Optional: Custom colors
  colors: {
    primary: "#YOUR_COLOR",
    accent: "#YOUR_ACCENT",
  },

  // Schema for database
  schema: {
    id: "string",
    title: "string",
    description: "string",
    image: "string",
    // ... other fields
  },
};
```

### Step 3: Register Your Module

Add to `modules/index.js`:

```javascript
import { YourModule } from "./your-module/YourModule";

export function initializeModules() {
  moduleRegistry.register(RecipeModule);
  moduleRegistry.register(MovieModule);
  moduleRegistry.register(BookModule);
  moduleRegistry.register(YourModule);  // Add your module

  moduleRegistry.setActive("recipes");
}
```

### Step 4: Use in Your App

```javascript
import { moduleRegistry } from "./modules";

// Get a module
const module = moduleRegistry.get("your-module-id");

// Use the API adapter
const results = await module.apiAdapter.search("query");

// Render with generic components
<ContentCard
  item={item}
  moduleId={module.id}
  cardFields={module.cardFields}
/>

<DetailView
  item={item}
  detailFields={module.detailFields}
  moduleColors={module.colors}
/>
```

## Field Types Reference

### Card Fields
- `title` - Main title (larger, bold)
- `description` - Description text (smaller, gray)
- `meta` - Metadata with icon (author, category, etc.)
- `footer` - Footer metadata (time, pages, etc.)

### Detail Fields
- `title` - Page title
- `text` - Long text content
- `meta` - Key-value metadata with icon
- `list` - Bulleted list
- `steps` - Numbered steps with circular badges

## Using the Favorites Service

```javascript
import { FavoritesService } from "./modules/core/services/FavoritesService";

// Add to favorites
await FavoritesService.add(userId, "recipes", recipeItem);

// Remove from favorites
await FavoritesService.remove(userId, "recipes", recipeItem.id);

// Get all favorites for a module
const favorites = await FavoritesService.getAll(userId, "recipes");

// Toggle favorite
const result = await FavoritesService.toggle(userId, "recipes", item, currentFavorites);
```

## Backend Changes

The backend now supports a **generic favorites table**:

```javascript
{
  id: serial,
  userId: string,
  moduleType: string,      // "recipes", "movies", "books", etc.
  itemId: string,          // ID from external API
  data: string,            // JSON string of full item data
  createdAt: timestamp
}
```

### API Endpoints

- `POST /api/favorites` - Add favorite (userId, moduleType, itemId, data)
- `GET /api/favorites/:userId/:moduleType` - Get favorites
- `DELETE /api/favorites/:userId/:moduleType/:itemId` - Remove favorite

## Example Use Cases

Here are content types you can easily add:

1. **Podcasts** (ListenNotes API)
2. **Workouts** (ExerciseDB API)
3. **Travel Destinations** (Google Places API)
4. **Products/Shopping** (Amazon/eBay API)
5. **Events/Concerts** (Ticketmaster API)
6. **Courses** (Udemy/Coursera API)
7. **Music** (Spotify API)
8. **Games** (RAWG API)
9. **News Articles** (NewsAPI)
10. **Restaurants** (Yelp API)

## Migration Guide

To migrate from the old recipe-only app to the modular framework:

### Frontend

1. Replace `RecipeCard` with `ContentCard`:
```javascript
// Old
<RecipeCard recipe={recipe} />

// New
<ContentCard
  item={recipe}
  moduleId="recipes"
  cardFields={RecipeModule.cardFields}
/>
```

2. Replace favorites service calls:
```javascript
// Old
await addToFavorites(userId, recipe);

// New
await FavoritesService.add(userId, "recipes", recipe);
```

### Backend

1. Run database migration to update the favorites table schema
2. All existing favorites will need to be migrated to the new format

## Configuration Options

### Module Configuration

```javascript
{
  id: string,              // Required: Unique identifier
  name: string,            // Required: Display name
  icon: string,            // Required: Ionicons icon name
  apiAdapter: object,      // Required: API adapter instance
  cardFields: array,       // Required: Card display config
  detailFields: array,     // Required: Detail view config
  colors: object,          // Optional: Custom colors
  schema: object,          // Optional: Data schema
  customComponents: object // Optional: Custom component overrides
}
```

## Best Practices

1. **API Keys**: Store API keys in environment variables, not in code
2. **Error Handling**: Always handle API errors gracefully
3. **Data Transformation**: Keep transformations simple and consistent
4. **Field Naming**: Use consistent field names across modules (title, description, image)
5. **Testing**: Test each module independently before registering

## Future Enhancements

Potential improvements to the framework:

- [ ] Module marketplace/plugin system
- [ ] Custom theme per module
- [ ] Advanced filtering and sorting
- [ ] Offline caching per module
- [ ] Module-specific settings
- [ ] Multi-source aggregation (combine multiple APIs)
- [ ] Analytics per module
- [ ] Export/import functionality

## Support

For questions or issues with the modular framework, please refer to:
- Framework documentation (this file)
- Example modules (recipes, movies, books)
- Core interface definitions in `modules/core/interfaces/`
