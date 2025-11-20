# Quick Start: Adding a Podcast Module

This guide walks through creating a **Podcast Module** as a complete example.

## Step-by-Step Implementation

### 1. Create the API Adapter

File: `mobile/modules/podcasts/PodcastAPIAdapter.js`

```javascript
import { IAPIAdapter } from "../core/interfaces/IAPIAdapter";

const BASE_URL = "https://listen-api.listennotes.com/api/v2";
const API_KEY = "YOUR_API_KEY"; // Get from listennotes.com

export class PodcastAPIAdapter extends IAPIAdapter {
  async search(query) {
    try {
      const response = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=podcast`,
        {
          headers: { "X-ListenAPI-Key": API_KEY },
        }
      );
      const data = await response.json();
      return (data.results || []).map((item) => this.transform(item));
    } catch (error) {
      console.error("Error searching podcasts:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${BASE_URL}/podcasts/${id}`, {
        headers: { "X-ListenAPI-Key": API_KEY },
      });
      const podcast = await response.json();
      return this.transform(podcast);
    } catch (error) {
      console.error("Error getting podcast:", error);
      return null;
    }
  }

  async getRandom(count = 6) {
    try {
      const response = await fetch(`${BASE_URL}/just_listen`, {
        headers: { "X-ListenAPI-Key": API_KEY },
      });
      const data = await response.json();
      // Return random podcasts from recommendations
      return [this.transform(data)];
    } catch (error) {
      console.error("Error getting random podcasts:", error);
      return [];
    }
  }

  async getCategories() {
    return [
      { id: 93, strCategory: "Business" },
      { id: 127, strCategory: "Technology" },
      { id: 122, strCategory: "Society & Culture" },
      { id: 111, strCategory: "Education" },
      { id: 68, strCategory: "TV & Film" },
      { id: 77, strCategory: "Sports" },
      { id: 133, strCategory: "Comedy" },
      { id: 107, strCategory: "Science" },
    ];
  }

  async filterByCategory(categoryId) {
    try {
      const response = await fetch(
        `${BASE_URL}/best_podcasts?genre_id=${categoryId}`,
        {
          headers: { "X-ListenAPI-Key": API_KEY },
        }
      );
      const data = await response.json();
      return (data.podcasts || []).map((item) => this.transform(item));
    } catch (error) {
      console.error("Error filtering podcasts:", error);
      return [];
    }
  }

  transform(podcast) {
    if (!podcast) return null;

    return {
      id: podcast.id,
      title: podcast.title || podcast.podcast_title_original,
      description: podcast.description?.substring(0, 200) + "..." || "No description",
      image: podcast.image || podcast.thumbnail,
      publisher: podcast.publisher || podcast.publisher_original,
      totalEpisodes: podcast.total_episodes || "N/A",
      language: podcast.language?.toUpperCase() || "EN",
      website: podcast.website,
      genres: podcast.genres?.map((g) => g.name).join(", ") || "N/A",
      latestPubDate: podcast.latest_pub_date_ms
        ? new Date(podcast.latest_pub_date_ms).toLocaleDateString()
        : "N/A",
      originalData: podcast,
    };
  }
}
```

### 2. Create the Module Configuration

File: `mobile/modules/podcasts/PodcastModule.js`

```javascript
import { PodcastAPIAdapter } from "./PodcastAPIAdapter";

export const PodcastModule = {
  id: "podcasts",
  name: "Podcasts",
  icon: "mic-outline",
  apiAdapter: new PodcastAPIAdapter(),

  cardFields: [
    { key: "title", type: "title" },
    { key: "publisher", type: "meta", icon: "person-outline" },
    { key: "description", type: "description" },
    { key: "totalEpisodes", type: "footer", icon: "musical-notes-outline" },
    { key: "language", type: "footer", icon: "language-outline" },
  ],

  detailFields: [
    { key: "title", type: "title" },
    { key: "description", type: "text" },
    { key: "publisher", type: "meta", icon: "person-outline", label: "Publisher" },
    { key: "totalEpisodes", type: "meta", icon: "musical-notes-outline", label: "Episodes" },
    { key: "genres", type: "meta", icon: "pricetag-outline", label: "Genres" },
    { key: "language", type: "meta", icon: "language-outline", label: "Language" },
    { key: "latestPubDate", type: "meta", icon: "calendar-outline", label: "Latest Episode" },
  ],

  colors: {
    primary: "#9B59B6", // Purple for podcasts
    accent: "#E74C3C",  // Red accent
  },

  schema: {
    id: "string",
    title: "string",
    description: "string",
    image: "string",
    publisher: "string",
    totalEpisodes: "string",
    language: "string",
    website: "string",
    genres: "string",
    latestPubDate: "string",
  },
};
```

### 3. Register the Module

Update `mobile/modules/index.js`:

```javascript
import { moduleRegistry } from "./core/ModuleRegistry";
import { RecipeModule } from "./recipes/RecipeModule";
import { MovieModule } from "./movies/MovieModule";
import { BookModule } from "./books/BookModule";
import { PodcastModule } from "./podcasts/PodcastModule"; // Add import

export function initializeModules() {
  moduleRegistry.register(RecipeModule);
  moduleRegistry.register(MovieModule);
  moduleRegistry.register(BookModule);
  moduleRegistry.register(PodcastModule); // Register podcast module

  moduleRegistry.setActive("recipes");

  console.log("Modules initialized:", moduleRegistry.getAll().map((m) => m.name));
}

export { moduleRegistry };
export { RecipeModule, MovieModule, BookModule, PodcastModule }; // Export
```

### 4. Use in Your App

Create a new screen or update existing ones:

```javascript
import { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { moduleRegistry } from "../modules";
import ContentCard from "../modules/core/components/ContentCard";

export default function PodcastsScreen() {
  const [podcasts, setPodcasts] = useState([]);
  const podcastModule = moduleRegistry.get("podcasts");

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    const results = await podcastModule.apiAdapter.getRandom(10);
    setPodcasts(results);
  };

  const searchPodcasts = async (query) => {
    const results = await podcastModule.apiAdapter.search(query);
    setPodcasts(results);
  };

  return (
    <View>
      <FlatList
        data={podcasts}
        renderItem={({ item }) => (
          <ContentCard
            item={item}
            moduleId={podcastModule.id}
            cardFields={podcastModule.cardFields}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
```

### 5. Add Module Switcher (Optional)

Create a module switcher component:

```javascript
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moduleRegistry } from "../modules";

export default function ModuleSwitcher({ onModuleChange }) {
  const modules = moduleRegistry.getAll();
  const activeModule = moduleRegistry.getActive();

  const handleModuleSelect = (moduleId) => {
    moduleRegistry.setActive(moduleId);
    onModuleChange(moduleId);
  };

  return (
    <View style={styles.container}>
      {modules.map((module) => (
        <TouchableOpacity
          key={module.id}
          style={[
            styles.moduleButton,
            activeModule?.id === module.id && styles.activeButton,
          ]}
          onPress={() => handleModuleSelect(module.id)}
        >
          <Ionicons
            name={module.icon}
            size={24}
            color={activeModule?.id === module.id ? "#FFFFFF" : "#666666"}
          />
          <Text
            style={[
              styles.moduleText,
              activeModule?.id === module.id && styles.activeText,
            ]}
          >
            {module.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  moduleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    gap: 8,
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  moduleText: {
    fontSize: 14,
    color: "#666666",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
```

## That's it!

You now have a fully functional podcast module that:
- ✅ Searches podcasts
- ✅ Displays podcast cards
- ✅ Shows detailed podcast information
- ✅ Supports favorites
- ✅ Filters by genre
- ✅ Uses the same UI components as other modules

## Tips

1. **API Keys**: Always use environment variables:
   ```javascript
   const API_KEY = process.env.LISTEN_NOTES_API_KEY;
   ```

2. **Error States**: Add loading and error states:
   ```javascript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   ```

3. **Caching**: Consider caching API responses:
   ```javascript
   const cache = new Map();
   if (cache.has(query)) return cache.get(query);
   ```

4. **Rate Limiting**: Respect API rate limits with debouncing:
   ```javascript
   import { useDebounce } from "../hooks/useDebounce";
   const debouncedSearch = useDebounce(searchQuery, 500);
   ```

## More Examples

See the existing modules for more patterns:
- **Recipes**: Complex data transformation (ingredients, steps)
- **Movies**: Image handling (posters, backdrops)
- **Books**: Simple text-heavy content

Happy coding!
