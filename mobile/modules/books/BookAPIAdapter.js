import { IAPIAdapter } from "../core/interfaces/IAPIAdapter";

const BASE_URL = "https://www.googleapis.com/books/v1";

/**
 * Book API Adapter
 * Implements IAPIAdapter for Google Books API
 */
export class BookAPIAdapter extends IAPIAdapter {
  async search(query) {
    try {
      const response = await fetch(
        `${BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=20`
      );
      const data = await response.json();
      const books = data.items || [];
      return books.map((book) => this.transform(book));
    } catch (error) {
      console.error("Error searching books:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${BASE_URL}/volumes/${id}`);
      const book = await response.json();
      return this.transform(book);
    } catch (error) {
      console.error("Error getting book by id:", error);
      return null;
    }
  }

  async getRandom(count = 6) {
    try {
      // Google Books doesn't have random, so we'll search popular terms
      const searchTerms = ["bestseller", "fiction", "science", "history", "biography", "fantasy"];
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const response = await fetch(
        `${BASE_URL}/volumes?q=${randomTerm}&orderBy=relevance&maxResults=${count}`
      );
      const data = await response.json();
      const books = data.items || [];
      return books.map((book) => this.transform(book));
    } catch (error) {
      console.error("Error getting random books:", error);
      return [];
    }
  }

  async getCategories() {
    // Google Books API doesn't have a categories endpoint
    // Return predefined popular categories
    return [
      { id: "fiction", strCategory: "Fiction" },
      { id: "non-fiction", strCategory: "Non-Fiction" },
      { id: "science", strCategory: "Science" },
      { id: "history", strCategory: "History" },
      { id: "biography", strCategory: "Biography" },
      { id: "fantasy", strCategory: "Fantasy" },
      { id: "mystery", strCategory: "Mystery" },
      { id: "romance", strCategory: "Romance" },
      { id: "self-help", strCategory: "Self-Help" },
      { id: "business", strCategory: "Business" },
    ];
  }

  async filterByCategory(category) {
    try {
      const response = await fetch(
        `${BASE_URL}/volumes?q=subject:${encodeURIComponent(category)}&maxResults=20`
      );
      const data = await response.json();
      const books = data.items || [];
      return books.map((book) => this.transform(book));
    } catch (error) {
      console.error("Error filtering books by category:", error);
      return [];
    }
  }

  transform(book) {
    if (!book || !book.volumeInfo) return null;

    const info = book.volumeInfo;

    return {
      id: book.id,
      title: info.title,
      description: info.description || "No description available",
      image: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
      authors: info.authors ? info.authors.join(", ") : "Unknown Author",
      publisher: info.publisher || "Unknown Publisher",
      publishedDate: info.publishedDate || "N/A",
      pageCount: info.pageCount ? `${info.pageCount} pages` : "N/A",
      categories: info.categories ? info.categories.join(", ") : "N/A",
      rating: info.averageRating ? `${info.averageRating}/5` : "N/A",
      language: info.language?.toUpperCase() || "N/A",
      isbn: info.industryIdentifiers?.[0]?.identifier || "N/A",
      originalData: book,
    };
  }
}
