import { IAPIAdapter } from "../core/interfaces/IAPIAdapter";

const BASE_URL = "https://api.themoviedb.org/3";
// Note: In production, this should be stored in environment variables
const API_KEY = "YOUR_TMDB_API_KEY"; // Users need to get their own key from themoviedb.org

/**
 * Movie API Adapter
 * Implements IAPIAdapter for The Movie Database (TMDB) API
 */
export class MovieAPIAdapter extends IAPIAdapter {
  async search(query) {
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const movies = data.results || [];
      return movies.map((movie) => this.transform(movie));
    } catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
      const movie = await response.json();
      return this.transform(movie);
    } catch (error) {
      console.error("Error getting movie by id:", error);
      return null;
    }
  }

  async getRandom(count = 6) {
    try {
      // TMDB doesn't have a random endpoint, so we'll get popular movies
      const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
      const data = await response.json();
      const movies = data.results || [];
      // Shuffle and take random subset
      const shuffled = movies.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map((movie) => this.transform(movie));
    } catch (error) {
      console.error("Error getting random movies:", error);
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
      const data = await response.json();
      return data.genres || [];
    } catch (error) {
      console.error("Error getting movie genres:", error);
      return [];
    }
  }

  async filterByCategory(genreId) {
    try {
      const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
      );
      const data = await response.json();
      const movies = data.results || [];
      return movies.map((movie) => this.transform(movie));
    } catch (error) {
      console.error("Error filtering movies by genre:", error);
      return [];
    }
  }

  transform(movie) {
    if (!movie) return null;

    const imageBase = "https://image.tmdb.org/t/p/w500";

    return {
      id: movie.id,
      title: movie.title,
      description: movie.overview || "No description available",
      image: movie.poster_path ? `${imageBase}${movie.poster_path}` : null,
      backdropImage: movie.backdrop_path ? `${imageBase}${movie.backdrop_path}` : null,
      releaseDate: movie.release_date,
      rating: movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "N/A",
      runtime: movie.runtime ? `${movie.runtime} min` : "N/A",
      genres: movie.genres ? movie.genres.map((g) => g.name).join(", ") : movie.genre_ids?.join(", ") || "N/A",
      popularity: movie.popularity,
      voteCount: movie.vote_count,
      originalData: movie,
    };
  }
}
