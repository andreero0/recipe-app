import { BaseAPIAdapter } from "./BaseAPIAdapter";

/**
 * Module Factory - Create modules efficiently with standardized patterns
 */

/**
 * Create a generic API adapter from configuration
 */
export function createAPIAdapter(config) {
  const {
    baseURL,
    apiKey,
    endpoints,
    transform,
    headers = {},
    categories = [],
  } = config;

  return new (class extends BaseAPIAdapter {
    constructor() {
      super({
        baseURL,
        apiKey,
        headers: apiKey
          ? { ...headers, [config.apiKeyHeader || "X-API-Key"]: apiKey }
          : headers,
      });
      this.endpoints = endpoints;
      this.categories = categories;
      this.transformFn = transform;
    }

    async search(query) {
      try {
        const endpoint = this.endpoints.search.replace("{query}", encodeURIComponent(query));
        const data = await this.request(endpoint);
        const items = this.endpoints.searchResultPath
          ? this.getNestedValue(data, this.endpoints.searchResultPath)
          : data;
        return this.transformMany(items || []);
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    }

    async getById(id) {
      try {
        const endpoint = this.endpoints.getById.replace("{id}", id);
        const data = await this.request(endpoint);
        const item = this.endpoints.getByIdResultPath
          ? this.getNestedValue(data, this.endpoints.getByIdResultPath)
          : data;
        return this.transform(item);
      } catch (error) {
        console.error("GetById error:", error);
        return null;
      }
    }

    async getRandom(count = 6) {
      if (this.endpoints.random) {
        try {
          const promises = Array(count)
            .fill()
            .map(() => this.request(this.endpoints.random));
          const results = await Promise.allSettled(promises);
          return results
            .filter((r) => r.status === "fulfilled")
            .map((r) => {
              const item = this.endpoints.randomResultPath
                ? this.getNestedValue(r.value, this.endpoints.randomResultPath)
                : r.value;
              return this.transform(item);
            })
            .filter(Boolean);
        } catch (error) {
          console.error("GetRandom error:", error);
          return [];
        }
      }

      // Fallback: get popular/trending
      if (this.endpoints.popular) {
        try {
          const data = await this.request(this.endpoints.popular);
          const items = this.endpoints.popularResultPath
            ? this.getNestedValue(data, this.endpoints.popularResultPath)
            : data;
          return this.transformMany((items || []).slice(0, count));
        } catch (error) {
          console.error("GetPopular error:", error);
          return [];
        }
      }

      return [];
    }

    async getCategories() {
      if (Array.isArray(this.categories) && this.categories.length > 0) {
        return this.categories;
      }

      if (this.endpoints.categories) {
        try {
          const data = await this.request(this.endpoints.categories);
          return this.endpoints.categoriesResultPath
            ? this.getNestedValue(data, this.endpoints.categoriesResultPath)
            : data;
        } catch (error) {
          console.error("GetCategories error:", error);
          return [];
        }
      }

      return [];
    }

    async filterByCategory(category) {
      try {
        const endpoint = this.endpoints.filterByCategory.replace("{category}", encodeURIComponent(category));
        const data = await this.request(endpoint);
        const items = this.endpoints.filterResultPath
          ? this.getNestedValue(data, this.endpoints.filterResultPath)
          : data;
        return this.transformMany(items || []);
      } catch (error) {
        console.error("FilterByCategory error:", error);
        return [];
      }
    }

    transform(data) {
      return this.transformFn(data);
    }

    getNestedValue(obj, path) {
      return path.split(".").reduce((acc, part) => acc?.[part], obj);
    }
  })();
}

/**
 * Create a complete module configuration
 */
export function createModule({ id, name, icon, apiConfig, fields, colors, schema }) {
  return {
    id,
    name,
    icon,
    apiAdapter: createAPIAdapter(apiConfig),
    cardFields: fields.card,
    detailFields: fields.detail,
    colors,
    schema,
  };
}
