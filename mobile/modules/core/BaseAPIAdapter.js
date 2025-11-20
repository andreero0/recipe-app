import { apiClient } from "./APIClient";

/**
 * Base API Adapter with optimized caching and error handling
 * All module adapters extend this class
 */
export class BaseAPIAdapter {
  constructor(config = {}) {
    this.baseURL = config.baseURL || "";
    this.apiKey = config.apiKey || "";
    this.headers = config.headers || {};
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 minutes default
    this.retryAttempts = config.retryAttempts || 2;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Build headers with API key
   */
  getHeaders(additionalHeaders = {}) {
    return {
      "Content-Type": "application/json",
      ...this.headers,
      ...additionalHeaders,
    };
  }

  /**
   * Make optimized API request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`;
    const requestOptions = {
      headers: this.getHeaders(options.headers),
      cacheTTL: this.cacheTTL,
      ...options,
    };

    let lastError;
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        return await apiClient.fetch(url, requestOptions);
      } catch (error) {
        lastError = error;
        if (attempt < this.retryAttempts) {
          await this.sleep(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    console.error(`Request failed after ${this.retryAttempts + 1} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Sleep utility for retry delay
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Transform array of items
   */
  transformMany(items) {
    if (!Array.isArray(items)) return [];
    return items.map((item) => this.transform(item)).filter(Boolean);
  }

  /**
   * Batch fetch multiple items by IDs
   */
  async batchGetByIds(ids) {
    const requests = ids.map((id) => ({
      url: this.buildGetByIdUrl(id),
      options: { headers: this.getHeaders() },
    }));

    const results = await apiClient.batchFetch(requests);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => this.transform(result.value));
  }

  /**
   * Default implementations (to be overridden)
   */
  async search(query) {
    throw new Error("search() must be implemented");
  }

  async getById(id) {
    throw new Error("getById() must be implemented");
  }

  async getRandom(count = 6) {
    throw new Error("getRandom() must be implemented");
  }

  async getCategories() {
    throw new Error("getCategories() must be implemented");
  }

  async filterByCategory(category) {
    throw new Error("filterByCategory() must be implemented");
  }

  transform(data) {
    throw new Error("transform() must be implemented");
  }
}
