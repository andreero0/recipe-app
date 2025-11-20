import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Offline Storage Manager
 * Handles data persistence for offline functionality
 */

class OfflineStorage {
  constructor() {
    this.prefix = "@ContentHub:";
    this.maxSize = 50 * 1024 * 1024; // 50MB limit
  }

  /**
   * Get key with prefix
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Save data with expiration
   */
  async set(key, data, expiresIn = null) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : null,
      };

      await AsyncStorage.setItem(this.getKey(key), JSON.stringify(item));
      return true;
    } catch (error) {
      console.error("OfflineStorage.set error:", error);
      // Handle quota exceeded
      if (error.message.includes("quota")) {
        await this.cleanup();
        // Retry once after cleanup
        try {
          await AsyncStorage.setItem(this.getKey(key), JSON.stringify({ data, timestamp: Date.now() }));
          return true;
        } catch (retryError) {
          console.error("OfflineStorage.set retry failed:", retryError);
        }
      }
      return false;
    }
  }

  /**
   * Get data if not expired
   */
  async get(key) {
    try {
      const item = await AsyncStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Check expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        await this.remove(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("OfflineStorage.get error:", error);
      return null;
    }
  }

  /**
   * Remove item
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error("OfflineStorage.remove error:", error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
      return true;
    } catch (error) {
      console.error("OfflineStorage.clear error:", error);
      return false;
    }
  }

  /**
   * Cleanup expired items
   */
  async cleanup() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));

      for (const key of appKeys) {
        const item = await AsyncStorage.getItem(key);
        if (!item) continue;

        try {
          const parsed = JSON.parse(item);
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        } catch (e) {
          // Invalid JSON, remove it
          await AsyncStorage.removeItem(key);
        }
      }

      return true;
    } catch (error) {
      console.error("OfflineStorage.cleanup error:", error);
      return false;
    }
  }

  /**
   * Get storage info
   */
  async getInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));

      let totalSize = 0;
      const items = [];

      for (const key of appKeys) {
        const item = await AsyncStorage.getItem(key);
        if (!item) continue;

        const size = new Blob([item]).size;
        totalSize += size;

        items.push({
          key: key.replace(this.prefix, ""),
          size,
          sizeKB: (size / 1024).toFixed(2),
        });
      }

      return {
        totalItems: appKeys.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        items: items.sort((a, b) => b.size - a.size),
      };
    } catch (error) {
      console.error("OfflineStorage.getInfo error:", error);
      return null;
    }
  }

  /**
   * Cache module data
   */
  async cacheModuleData(moduleId, dataType, data, ttl = 10 * 60 * 1000) {
    const key = `module:${moduleId}:${dataType}`;
    return this.set(key, data, ttl);
  }

  /**
   * Get cached module data
   */
  async getCachedModuleData(moduleId, dataType) {
    const key = `module:${moduleId}:${dataType}`;
    return this.get(key);
  }

  /**
   * Cache search results
   */
  async cacheSearch(moduleId, query, results, ttl = 5 * 60 * 1000) {
    const key = `search:${moduleId}:${query}`;
    return this.set(key, results, ttl);
  }

  /**
   * Get cached search
   */
  async getCachedSearch(moduleId, query) {
    const key = `search:${moduleId}:${query}`;
    return this.get(key);
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Auto-cleanup on app start
setTimeout(() => {
  offlineStorage.cleanup();
}, 1000);
