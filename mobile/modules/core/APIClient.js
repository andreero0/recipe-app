/**
 * Centralized API Client with Caching, Rate Limiting, and Request Deduplication
 * Optimized for large-scale usage
 */

class APIClient {
  constructor() {
    // In-memory cache with TTL
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes

    // Request deduplication (prevent duplicate in-flight requests)
    this.pendingRequests = new Map();

    // Rate limiting
    this.rateLimits = new Map();
    this.requestCounts = new Map();

    // Performance metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      avgResponseTime: 0,
    };
  }

  /**
   * Get cache key for request
   */
  getCacheKey(url, options = {}) {
    return `${url}-${JSON.stringify(options)}`;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(key) {
    const expiry = this.cacheExpiry.get(key);
    return expiry && Date.now() < expiry;
  }

  /**
   * Get from cache
   */
  getFromCache(key) {
    if (this.isCacheValid(key)) {
      this.metrics.hits++;
      return this.cache.get(key);
    }
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  /**
   * Set cache with TTL
   */
  setCache(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);

    // Auto-cleanup old cache entries
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Check rate limit
   */
  checkRateLimit(apiKey) {
    if (!apiKey) return true;

    const limit = this.rateLimits.get(apiKey) || { max: 100, window: 60000 }; // 100 req/min
    const count = this.requestCounts.get(apiKey) || { count: 0, resetAt: Date.now() + limit.window };

    if (Date.now() > count.resetAt) {
      count.count = 0;
      count.resetAt = Date.now() + limit.window;
    }

    if (count.count >= limit.max) {
      return false; // Rate limit exceeded
    }

    count.count++;
    this.requestCounts.set(apiKey, count);
    return true;
  }

  /**
   * Optimized fetch with caching, deduplication, and rate limiting
   */
  async fetch(url, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    // Check cache first
    const cacheKey = this.getCacheKey(url, options);
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.metrics.misses++;

    // Check for pending request (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check rate limit
    const apiKey = options.headers?.["X-API-Key"] || options.headers?.["Authorization"];
    if (!this.checkRateLimit(apiKey)) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // Make request
    const requestPromise = fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        // Cache successful response
        this.setCache(cacheKey, data, options.cacheTTL);

        // Update metrics
        const responseTime = Date.now() - startTime;
        this.metrics.avgResponseTime =
          (this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
          this.metrics.totalRequests;

        return data;
      })
      .catch((error) => {
        this.metrics.errors++;
        console.error("API Request failed:", error);
        throw error;
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Batch multiple requests
   */
  async batchFetch(requests) {
    return Promise.allSettled(requests.map((req) => this.fetch(req.url, req.options)));
  }

  /**
   * Clear cache for specific pattern
   */
  clearCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      this.cacheExpiry.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
    };
  }

  /**
   * Prefetch data
   */
  async prefetch(urls) {
    return Promise.allSettled(urls.map((url) => this.fetch(url)));
  }
}

// Singleton instance
export const apiClient = new APIClient();
