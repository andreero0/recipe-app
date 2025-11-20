import { MovieAPIAdapter } from "./MovieAPIAdapter";

/**
 * Movie Module Configuration
 */
export const MovieModule = {
  id: "movies",
  name: "Movies",
  icon: "film-outline",
  apiAdapter: new MovieAPIAdapter(),

  // Card display configuration
  cardFields: [
    { key: "title", type: "title" },
    { key: "description", type: "description" },
    { key: "releaseDate", type: "footer", icon: "calendar-outline" },
    { key: "rating", type: "footer", icon: "star-outline" },
  ],

  // Detail view configuration
  detailFields: [
    { key: "title", type: "title" },
    { key: "description", type: "text" },
    { key: "releaseDate", type: "meta", icon: "calendar-outline", label: "Release Date" },
    { key: "rating", type: "meta", icon: "star-outline", label: "Rating" },
    { key: "runtime", type: "meta", icon: "time-outline", label: "Runtime" },
    { key: "genres", type: "meta", icon: "pricetag-outline", label: "Genres" },
  ],

  // Module-specific colors
  colors: {
    primary: "#E50914", // Netflix red
    accent: "#FFD700", // Gold for ratings
  },

  // Schema for database storage
  schema: {
    id: "number",
    title: "string",
    description: "string",
    image: "string",
    backdropImage: "string",
    releaseDate: "string",
    rating: "string",
    runtime: "string",
    genres: "string",
    popularity: "number",
    voteCount: "number",
  },
};
