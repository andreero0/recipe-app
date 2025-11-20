/**
 * Centralized Module Configurations
 * All modules defined in one place for efficiency and maintainability
 */

export const ALL_MODULES_CONFIG = {
  // ==================== FOOD & RECIPES ====================
  recipes: {
    id: "recipes",
    name: "Recipes",
    icon: "restaurant-outline",
    apiConfig: {
      baseURL: "https://www.themealdb.com/api/json/v1/1",
      endpoints: {
        search: "/search.php?s={query}",
        getById: "/lookup.php?i={id}",
        random: "/random.php",
        categories: "/categories.php",
        filterByCategory: "/filter.php?c={category}",
        searchResultPath: "meals",
        getByIdResultPath: "meals.0",
        randomResultPath: "meals.0",
        categoriesResultPath: "categories",
        filterResultPath: "meals",
      },
      transform: (meal) => {
        if (!meal) return null;
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient?.trim()) {
            ingredients.push(`${measure?.trim() || ""} ${ingredient.trim()}`.trim());
          }
        }
        return {
          id: meal.idMeal,
          title: meal.strMeal,
          description: meal.strInstructions?.substring(0, 120) + "..." || "Delicious meal",
          image: meal.strMealThumb,
          cookTime: "30 min",
          servings: "4 servings",
          category: meal.strCategory || "Main Course",
          area: meal.strArea,
          ingredients,
          instructions: meal.strInstructions?.split(/\r?\n/).filter((s) => s.trim()) || [],
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "description", type: "description" },
        { key: "cookTime", type: "footer", icon: "time-outline" },
        { key: "servings", type: "footer", icon: "people-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "category", type: "meta", icon: "pricetag-outline", label: "Category" },
        { key: "area", type: "meta", icon: "location-outline", label: "Cuisine" },
        { key: "cookTime", type: "meta", icon: "time-outline", label: "Cook Time" },
        { key: "servings", type: "meta", icon: "people-outline", label: "Servings" },
        { key: "ingredients", type: "list", label: "Ingredients" },
        { key: "instructions", type: "steps", label: "Instructions" },
      ],
    },
    colors: { primary: "#FF6B6B", accent: "#4ECDC4" },
  },

  // ==================== MOVIES & TV ====================
  movies: {
    id: "movies",
    name: "Movies",
    icon: "film-outline",
    apiConfig: {
      baseURL: "https://api.themoviedb.org/3",
      apiKey: "YOUR_TMDB_API_KEY",
      apiKeyHeader: "Authorization",
      headers: { Authorization: "Bearer YOUR_TMDB_API_KEY" },
      endpoints: {
        search: "/search/movie?query={query}",
        getById: "/movie/{id}",
        popular: "/movie/popular",
        categories: "/genre/movie/list",
        filterByCategory: "/discover/movie?with_genres={category}",
        searchResultPath: "results",
        popularResultPath: "results",
        categoriesResultPath: "genres",
        filterResultPath: "results",
      },
      transform: (movie) => {
        if (!movie) return null;
        const base = "https://image.tmdb.org/t/p/w500";
        return {
          id: movie.id,
          title: movie.title,
          description: movie.overview || "No description",
          image: movie.poster_path ? `${base}${movie.poster_path}` : null,
          releaseDate: movie.release_date,
          rating: movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "N/A",
          runtime: movie.runtime ? `${movie.runtime} min` : "N/A",
          genres: movie.genres?.map((g) => g.name).join(", ") || "N/A",
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "description", type: "description" },
        { key: "releaseDate", type: "footer", icon: "calendar-outline" },
        { key: "rating", type: "footer", icon: "star-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "description", type: "text" },
        { key: "releaseDate", type: "meta", icon: "calendar-outline", label: "Release" },
        { key: "rating", type: "meta", icon: "star-outline", label: "Rating" },
        { key: "runtime", type: "meta", icon: "time-outline", label: "Runtime" },
        { key: "genres", type: "meta", icon: "pricetag-outline", label: "Genres" },
      ],
    },
    colors: { primary: "#E50914", accent: "#FFD700" },
  },

  // ==================== BOOKS ====================
  books: {
    id: "books",
    name: "Books",
    icon: "book-outline",
    apiConfig: {
      baseURL: "https://www.googleapis.com/books/v1",
      endpoints: {
        search: "/volumes?q={query}&maxResults=20",
        getById: "/volumes/{id}",
        popular: "/volumes?q=bestseller&orderBy=relevance&maxResults=20",
        searchResultPath: "items",
        popularResultPath: "items",
      },
      categories: [
        { id: "fiction", strCategory: "Fiction" },
        { id: "non-fiction", strCategory: "Non-Fiction" },
        { id: "science", strCategory: "Science" },
        { id: "history", strCategory: "History" },
        { id: "biography", strCategory: "Biography" },
        { id: "fantasy", strCategory: "Fantasy" },
        { id: "mystery", strCategory: "Mystery" },
        { id: "business", strCategory: "Business" },
      ],
      transform: (book) => {
        if (!book?.volumeInfo) return null;
        const info = book.volumeInfo;
        return {
          id: book.id,
          title: info.title,
          description: info.description?.substring(0, 200) + "..." || "No description",
          image: info.imageLinks?.thumbnail || null,
          authors: info.authors?.join(", ") || "Unknown",
          publisher: info.publisher || "Unknown",
          publishedDate: info.publishedDate || "N/A",
          pageCount: info.pageCount ? `${info.pageCount} pages` : "N/A",
          categories: info.categories?.join(", ") || "N/A",
          rating: info.averageRating ? `${info.averageRating}/5` : "N/A",
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "authors", type: "meta", icon: "person-outline" },
        { key: "description", type: "description" },
        { key: "publishedDate", type: "footer", icon: "calendar-outline" },
        { key: "pageCount", type: "footer", icon: "document-text-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "authors", type: "meta", icon: "person-outline", label: "Authors" },
        { key: "description", type: "text" },
        { key: "publisher", type: "meta", icon: "business-outline", label: "Publisher" },
        { key: "publishedDate", type: "meta", icon: "calendar-outline", label: "Published" },
        { key: "pageCount", type: "meta", icon: "document-text-outline", label: "Pages" },
        { key: "categories", type: "meta", icon: "pricetag-outline", label: "Categories" },
        { key: "rating", type: "meta", icon: "star-outline", label: "Rating" },
      ],
    },
    colors: { primary: "#4A90E2", accent: "#F5A623" },
  },

  // ==================== PODCASTS ====================
  podcasts: {
    id: "podcasts",
    name: "Podcasts",
    icon: "mic-outline",
    apiConfig: {
      baseURL: "https://listen-api.listennotes.com/api/v2",
      apiKey: "YOUR_LISTENNOTES_KEY",
      endpoints: {
        search: "/search?q={query}&type=podcast",
        getById: "/podcasts/{id}",
        popular: "/best_podcasts",
        categories: "/genres",
        filterByCategory: "/best_podcasts?genre_id={category}",
        searchResultPath: "results",
        popularResultPath: "podcasts",
        categoriesResultPath: "genres",
        filterResultPath: "podcasts",
      },
      transform: (podcast) => {
        if (!podcast) return null;
        return {
          id: podcast.id,
          title: podcast.title || podcast.podcast_title_original,
          description: podcast.description?.substring(0, 200) + "..." || "No description",
          image: podcast.image || podcast.thumbnail,
          publisher: podcast.publisher,
          totalEpisodes: podcast.total_episodes || "N/A",
          language: podcast.language?.toUpperCase() || "EN",
          genres: podcast.genres?.map((g) => g.name).join(", ") || "N/A",
          latestPubDate: podcast.latest_pub_date_ms
            ? new Date(podcast.latest_pub_date_ms).toLocaleDateString()
            : "N/A",
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "publisher", type: "meta", icon: "person-outline" },
        { key: "description", type: "description" },
        { key: "totalEpisodes", type: "footer", icon: "musical-notes-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "description", type: "text" },
        { key: "publisher", type: "meta", icon: "person-outline", label: "Publisher" },
        { key: "totalEpisodes", type: "meta", icon: "musical-notes-outline", label: "Episodes" },
        { key: "genres", type: "meta", icon: "pricetag-outline", label: "Genres" },
        { key: "latestPubDate", type: "meta", icon: "calendar-outline", label: "Latest" },
      ],
    },
    colors: { primary: "#9B59B6", accent: "#E74C3C" },
  },

  // ==================== MUSIC ====================
  music: {
    id: "music",
    name: "Music",
    icon: "musical-notes-outline",
    apiConfig: {
      baseURL: "https://api.spotify.com/v1",
      apiKey: "YOUR_SPOTIFY_TOKEN",
      headers: { Authorization: "Bearer YOUR_SPOTIFY_TOKEN" },
      endpoints: {
        search: "/search?q={query}&type=album&limit=20",
        getById: "/albums/{id}",
        popular: "/browse/new-releases?limit=20",
        categories: "/browse/categories",
        filterByCategory: "/browse/categories/{category}/playlists",
        searchResultPath: "albums.items",
        popularResultPath: "albums.items",
        categoriesResultPath: "categories.items",
      },
      transform: (album) => {
        if (!album) return null;
        return {
          id: album.id,
          title: album.name,
          description: `${album.artists?.[0]?.name || "Unknown"} • ${album.total_tracks} tracks`,
          image: album.images?.[0]?.url || null,
          artist: album.artists?.map((a) => a.name).join(", ") || "Unknown",
          releaseDate: album.release_date,
          totalTracks: `${album.total_tracks} tracks`,
          albumType: album.album_type,
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "artist", type: "meta", icon: "person-outline" },
        { key: "description", type: "description" },
        { key: "releaseDate", type: "footer", icon: "calendar-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "artist", type: "meta", icon: "person-outline", label: "Artist" },
        { key: "releaseDate", type: "meta", icon: "calendar-outline", label: "Released" },
        { key: "totalTracks", type: "meta", icon: "musical-notes-outline", label: "Tracks" },
        { key: "albumType", type: "meta", icon: "pricetag-outline", label: "Type" },
      ],
    },
    colors: { primary: "#1DB954", accent: "#191414" },
  },

  // ==================== WORKOUTS ====================
  workouts: {
    id: "workouts",
    name: "Workouts",
    icon: "barbell-outline",
    apiConfig: {
      baseURL: "https://exercisedb.p.rapidapi.com",
      apiKey: "YOUR_RAPIDAPI_KEY",
      apiKeyHeader: "X-RapidAPI-Key",
      headers: { "X-RapidAPI-Host": "exercisedb.p.rapidapi.com" },
      endpoints: {
        search: "/exercises/name/{query}",
        getById: "/exercises/exercise/{id}",
        popular: "/exercises?limit=20",
        categories: "/exercises/bodyPartList",
        filterByCategory: "/exercises/bodyPart/{category}",
      },
      transform: (exercise) => {
        if (!exercise) return null;
        return {
          id: exercise.id,
          title: exercise.name,
          description: `Target: ${exercise.target} • Equipment: ${exercise.equipment}`,
          image: exercise.gifUrl,
          bodyPart: exercise.bodyPart,
          equipment: exercise.equipment,
          target: exercise.target,
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "description", type: "description" },
        { key: "bodyPart", type: "footer", icon: "fitness-outline" },
        { key: "equipment", type: "footer", icon: "hardware-chip-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "bodyPart", type: "meta", icon: "fitness-outline", label: "Body Part" },
        { key: "target", type: "meta", icon: "locate-outline", label: "Target Muscle" },
        { key: "equipment", type: "meta", icon: "hardware-chip-outline", label: "Equipment" },
      ],
    },
    colors: { primary: "#FF5722", accent: "#FFC107" },
  },

  // ==================== GAMES ====================
  games: {
    id: "games",
    name: "Games",
    icon: "game-controller-outline",
    apiConfig: {
      baseURL: "https://api.rawg.io/api",
      apiKey: "YOUR_RAWG_KEY",
      endpoints: {
        search: "/games?search={query}&key=" + "YOUR_RAWG_KEY",
        getById: "/games/{id}?key=" + "YOUR_RAWG_KEY",
        popular: "/games?key=" + "YOUR_RAWG_KEY",
        categories: "/genres?key=" + "YOUR_RAWG_KEY",
        filterByCategory: "/games?genres={category}&key=" + "YOUR_RAWG_KEY",
        searchResultPath: "results",
        popularResultPath: "results",
        categoriesResultPath: "results",
        filterResultPath: "results",
      },
      transform: (game) => {
        if (!game) return null;
        return {
          id: game.id,
          title: game.name,
          description: game.description_raw?.substring(0, 200) + "..." || "No description",
          image: game.background_image,
          released: game.released,
          rating: game.rating ? `${game.rating}/5` : "N/A",
          platforms: game.platforms?.map((p) => p.platform.name).join(", ") || "N/A",
          genres: game.genres?.map((g) => g.name).join(", ") || "N/A",
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "description", type: "description" },
        { key: "released", type: "footer", icon: "calendar-outline" },
        { key: "rating", type: "footer", icon: "star-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "description", type: "text" },
        { key: "released", type: "meta", icon: "calendar-outline", label: "Released" },
        { key: "rating", type: "meta", icon: "star-outline", label: "Rating" },
        { key: "platforms", type: "meta", icon: "game-controller-outline", label: "Platforms" },
        { key: "genres", type: "meta", icon: "pricetag-outline", label: "Genres" },
      ],
    },
    colors: { primary: "#00D9FF", accent: "#FF00E5" },
  },

  // ==================== TRAVEL ====================
  travel: {
    id: "travel",
    name: "Travel",
    icon: "airplane-outline",
    apiConfig: {
      baseURL: "https://api.teleport.org/api",
      endpoints: {
        search: "/cities/?search={query}",
        getById: "/cities/geonameid:{id}",
        popular: "/urban_areas/",
        searchResultPath: "_embedded.city:search-results",
        popularResultPath: "_embedded.ua:item",
      },
      categories: [
        { id: "europe", strCategory: "Europe" },
        { id: "asia", strCategory: "Asia" },
        { id: "americas", strCategory: "Americas" },
        { id: "africa", strCategory: "Africa" },
        { id: "oceania", strCategory: "Oceania" },
      ],
      transform: (city) => {
        if (!city) return null;
        const matching = city._embedded?.["city:search-results"]?.[0];
        return {
          id: city.geoname_id || matching?.geoname_id || Math.random().toString(),
          title: city.name || matching?.matching_full_name || "Unknown City",
          description: city.full_name || matching?.matching_full_name || "Travel destination",
          image: city._links?.["ua:images"]?.href || null,
          population: city.population ? `${(city.population / 1000000).toFixed(1)}M people` : "N/A",
          country: city._links?.["city:country"]?.name || "N/A",
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "description", type: "description" },
        { key: "country", type: "footer", icon: "flag-outline" },
        { key: "population", type: "footer", icon: "people-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "description", type: "text" },
        { key: "country", type: "meta", icon: "flag-outline", label: "Country" },
        { key: "population", type: "meta", icon: "people-outline", label: "Population" },
      ],
    },
    colors: { primary: "#00BCD4", accent: "#FF9800" },
  },

  // ==================== EVENTS ====================
  events: {
    id: "events",
    name: "Events",
    icon: "calendar-outline",
    apiConfig: {
      baseURL: "https://app.ticketmaster.com/discovery/v2",
      apiKey: "YOUR_TICKETMASTER_KEY",
      endpoints: {
        search: "/events.json?keyword={query}&apikey=YOUR_TICKETMASTER_KEY",
        getById: "/events/{id}.json?apikey=YOUR_TICKETMASTER_KEY",
        popular: "/events.json?apikey=YOUR_TICKETMASTER_KEY",
        categories: "/classifications/genres.json?apikey=YOUR_TICKETMASTER_KEY",
        filterByCategory: "/events.json?genreId={category}&apikey=YOUR_TICKETMASTER_KEY",
        searchResultPath: "_embedded.events",
        popularResultPath: "_embedded.events",
        categoriesResultPath: "_embedded.genres",
        filterResultPath: "_embedded.events",
      },
      transform: (event) => {
        if (!event) return null;
        return {
          id: event.id,
          title: event.name,
          description: event.info || event.pleaseNote || "Event details",
          image: event.images?.[0]?.url || null,
          date: event.dates?.start?.localDate || "TBA",
          time: event.dates?.start?.localTime || "TBA",
          venue: event._embedded?.venues?.[0]?.name || "TBA",
          priceRange: event.priceRanges?.[0]
            ? `$${event.priceRanges[0].min}-$${event.priceRanges[0].max}`
            : "N/A",
        };
      },
    },
    fields: {
      card: [
        { key: "title", type: "title" },
        { key: "description", type: "description" },
        { key: "date", type: "footer", icon: "calendar-outline" },
        { key: "venue", type: "footer", icon: "location-outline" },
      ],
      detail: [
        { key: "title", type: "title" },
        { key: "description", type: "text" },
        { key: "date", type: "meta", icon: "calendar-outline", label: "Date" },
        { key: "time", type: "meta", icon: "time-outline", label: "Time" },
        { key: "venue", type: "meta", icon: "location-outline", label: "Venue" },
        { key: "priceRange", type: "meta", icon: "cash-outline", label: "Price" },
      ],
    },
    colors: { primary: "#673AB7", accent: "#FF4081" },
  },
};
