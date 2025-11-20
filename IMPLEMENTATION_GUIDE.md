# Quick Implementation Guide

## 🎯 Get Started in 5 Minutes

### Step 1: Initialize Modules (Required)

In your app entry point (`mobile/app/_layout.jsx`):

```javascript
import { useEffect } from "react";
import { initializeModules } from "../modules";

export default function RootLayout() {
  useEffect(() => {
    // Initialize all modules
    const stats = initializeModules();
    console.log(`✅ Loaded ${stats.loaded} modules in ${stats.duration}ms`);
  }, []);

  return (
    // Your app layout
  );
}
```

### Step 2: Use Central Hub (Recommended)

Replace your home screen with the Central Hub:

```javascript
import CentralHub from "../modules/core/components/CentralHub";
import { useAuth } from "@clerk/clerk-expo"; // or your auth provider

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <CentralHub
      userId={user?.id}
      initialModule="recipes"
      onModuleSelect={(moduleId) => {
        console.log("User switched to:", moduleId);
      }}
    />
  );
}
```

That's it! Your app now has 9 content types with:
- Global search across all modules
- Module switcher
- Performance stats
- Unified favorites

### Step 3: API Keys (Before Production)

Update `mobile/modules/AllModulesConfig.js` with your API keys:

```javascript
movies: {
  apiConfig: {
    apiKey: "your_tmdb_key_here",
    // ...
  }
},
podcasts: {
  apiConfig: {
    apiKey: "your_listennotes_key_here",
    // ...
  }
},
// ... etc
```

**Free APIs (No key needed):**
- Recipes (TheMealDB)
- Books (Google Books)
- Travel (Teleport)

**Requires API Key:**
- Movies (TMDB) - Get free key at https://www.themoviedb.org/settings/api
- Podcasts (ListenNotes) - Get key at https://www.listennotes.com/api/
- Music (Spotify) - Get token at https://developer.spotify.com/
- Workouts (ExerciseDB) - Get key at https://rapidapi.com/
- Games (RAWG) - Get key at https://rawg.io/apidocs
- Events (Ticketmaster) - Get key at https://developer.ticketmaster.com/

## 📱 Alternative: Use Individual Modules

If you prefer custom UI over the Central Hub:

```javascript
import { moduleRegistry } from "../modules";
import ContentCard from "../modules/core/components/ContentCard";
import { useModuleData } from "../modules/core/hooks/useModuleData";

export default function RecipesScreen() {
  // Get the recipes module
  const module = moduleRegistry.get("recipes");

  // Fetch data using the optimized hook
  const { data, loading, error, refetch } = useModuleData(
    module.apiAdapter,
    "getRandom",
    [10] // Get 10 random recipes
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <ContentCard
          item={item}
          moduleId="recipes"
          cardFields={module.cardFields}
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

## 🔍 Search Implementation

```javascript
import { useModuleSearch } from "../modules/core/hooks/useModuleData";

export default function SearchScreen() {
  const module = moduleRegistry.get("movies");

  const { query, setQuery, results, loading } = useModuleSearch(
    module.apiAdapter,
    "", // initial query
    300 // debounce delay in ms
  );

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search movies..."
      />

      {loading && <ActivityIndicator />}

      <FlatList
        data={results}
        renderItem={({ item }) => (
          <ContentCard
            item={item}
            moduleId="movies"
            cardFields={module.cardFields}
          />
        )}
      />
    </View>
  );
}
```

## ⭐ Favorites Implementation

```javascript
import { useFavorites } from "../modules/core/hooks/useModuleData";

export default function FavoritesScreen() {
  const { user } = useAuth();

  const {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
  } = useFavorites(user.id, "recipes");

  return (
    <FlatList
      data={favorites}
      renderItem={({ item }) => (
        <ContentCard
          item={JSON.parse(item.data)} // Parse stored JSON
          moduleId="recipes"
          cardFields={moduleRegistry.get("recipes").cardFields}
          onPress={() => toggleFavorite(JSON.parse(item.data))}
        />
      )}
    />
  );
}
```

## 📊 Performance Monitoring

Add to any screen:

```javascript
import PerformanceDashboard from "../modules/core/components/PerformanceDashboard";

export default function SettingsScreen() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setShowDashboard(true)}>
        <Text>View Performance Metrics</Text>
      </TouchableOpacity>

      <PerformanceDashboard
        visible={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </View>
  );
}
```

## 🗄️ Backend Setup

### Database Migration

Your favorites table needs to be updated. Run this SQL:

```sql
-- Drop old table
DROP TABLE IF EXISTS favorites;

-- Create new generic table
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_module ON favorites(module_type);
CREATE INDEX idx_favorites_user_module ON favorites(user_id, module_type);
```

Or use Drizzle to generate migration:

```bash
cd backend
npm run db:generate
npm run db:migrate
```

### Backend is Already Updated!

The backend endpoints have been updated to support all modules:

- `POST /api/favorites` - Add any content type
- `GET /api/favorites/:userId/:moduleType` - Get favorites for a module
- `DELETE /api/favorites/:userId/:moduleType/:itemId` - Remove favorite

## 🎨 Customization

### Change Active Module

```javascript
import { moduleRegistry } from "../modules";

// Switch active module
moduleRegistry.setActive("movies");

// Get current active
const active = moduleRegistry.getActive();
```

### Load Specific Modules Only

```javascript
// Only load modules you need
initializeModules(["recipes", "movies", "books"]);
```

### Lazy Load on Demand

```javascript
import { loadModule } from "../modules";

// Load when user navigates to that section
const handlePodcastsPress = async () => {
  const podcastModule = await loadModule("podcasts");
  navigation.navigate("Podcasts", { module: podcastModule });
};
```

## 🚀 Production Checklist

Before deploying:

1. ✅ Add real API keys to `AllModulesConfig.js`
2. ✅ Run database migration
3. ✅ Test each module
4. ✅ Set up error tracking (Sentry)
5. ✅ Configure environment variables
6. ✅ Test offline functionality
7. ✅ Monitor performance metrics
8. ✅ Set up analytics

## 📚 File Structure

```
mobile/
├── modules/
│   ├── core/
│   │   ├── APIClient.js                    # Caching & rate limiting
│   │   ├── BaseAPIAdapter.js               # Base adapter with retry
│   │   ├── ModuleFactory.js                # Factory pattern
│   │   ├── ModuleRegistry.js               # Module management
│   │   ├── OfflineStorage.js               # Offline persistence
│   │   ├── components/
│   │   │   ├── CentralHub.jsx              # Main hub UI
│   │   │   ├── ContentCard.jsx             # Generic card
│   │   │   ├── DetailView.jsx              # Generic detail
│   │   │   └── PerformanceDashboard.jsx    # Metrics UI
│   │   ├── hooks/
│   │   │   └── useModuleData.js            # Optimized hooks
│   │   ├── services/
│   │   │   └── FavoritesService.js         # Favorites API
│   │   └── interfaces/
│   │       └── IAPIAdapter.js              # Adapter interface
│   ├── AllModulesConfig.js                 # ALL 9 modules config
│   └── index.js                            # Module initialization
│
backend/
├── src/
│   ├── db/
│   │   └── schema.js                       # Updated schema
│   └── server.js                           # Updated endpoints
```

## 🆘 Troubleshooting

### "Module not found"

```javascript
// Make sure you initialized modules first
import { initializeModules } from "../modules";

useEffect(() => {
  initializeModules();
}, []);
```

### API Errors

```javascript
// Check if API key is set
const module = moduleRegistry.get("movies");
console.log(module.apiAdapter.apiKey); // Should not be "YOUR_TMDB_API_KEY"
```

### Favorites Not Working

```javascript
// Make sure backend is running and schema is updated
// Check network requests in debugger
// Verify userId is being passed correctly
```

### Performance Issues

```javascript
// Open performance dashboard
import PerformanceDashboard from "../modules/core/components/PerformanceDashboard";

// Check cache hit rate (should be > 50%)
// Clear cache if needed
// Reduce loaded modules
```

## 💡 Pro Tips

1. **Start with 2-3 modules** - Don't load all 9 at once initially
2. **Use Central Hub** - It's already optimized and battle-tested
3. **Monitor metrics** - Keep an eye on cache hit rates
4. **Go offline-first** - Cache everything you can
5. **Lazy load images** - Use expo-image for optimization
6. **Test on real devices** - Simulator doesn't show true performance

## 🎉 You're Ready!

Your app now has:
- ✅ 9 content types (Recipes, Movies, Books, Podcasts, Music, Workouts, Games, Travel, Events)
- ✅ Smart caching with TTL
- ✅ Request deduplication
- ✅ Rate limiting
- ✅ Offline support
- ✅ Unified search
- ✅ Performance monitoring
- ✅ Lazy loading
- ✅ Retry logic
- ✅ Generic favorites

All in a production-ready, scalable architecture! 🚀
