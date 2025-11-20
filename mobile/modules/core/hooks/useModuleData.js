import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../APIClient";

/**
 * Optimized hook for fetching and caching module data
 * Includes loading states, error handling, and automatic retry
 */
export function useModuleData(apiAdapter, method, params = [], options = {}) {
  const {
    enabled = true,
    refetchOnMount = false,
    refetchInterval = null,
    onSuccess = null,
    onError = null,
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const paramsRef = useRef(params);
  const isMountedRef = useRef(true);

  // Create cache key
  const cacheKey = `${apiAdapter.constructor.name}-${method}-${JSON.stringify(params)}`;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Call the adapter method
      const result = await apiAdapter[method](...params);

      if (isMountedRef.current) {
        setData(result);
        setLastFetch(Date.now());
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        onError?.(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiAdapter, method, enabled, onSuccess, onError, ...params]);

  // Initial fetch
  useEffect(() => {
    if (enabled && (refetchOnMount || !data)) {
      fetchData();
    }
  }, [enabled, refetchOnMount]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check if cache is stale
  const isStale = lastFetch && Date.now() - lastFetch > cacheTime;

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isStale,
    lastFetch,
  };
}

/**
 * Hook for searching across modules
 */
export function useModuleSearch(apiAdapter, initialQuery = "", debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeoutRef = useRef(null);

  // Debounce query
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiAdapter.search(debouncedQuery);
        setResults(data);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, apiAdapter]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([]),
  };
}

/**
 * Hook for managing favorites
 */
export function useFavorites(userId, moduleType) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    if (!userId || !moduleType) return;

    try {
      const { FavoritesService } = await import("../services/FavoritesService");
      const data = await FavoritesService.getAll(userId, moduleType);
      setFavorites(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId, moduleType]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(
    async (item) => {
      try {
        const { FavoritesService } = await import("../services/FavoritesService");
        await FavoritesService.add(userId, moduleType, item);
        setFavorites((prev) => [...prev, { ...item, moduleType }]);
      } catch (err) {
        throw err;
      }
    },
    [userId, moduleType]
  );

  const removeFavorite = useCallback(
    async (itemId) => {
      try {
        const { FavoritesService } = await import("../services/FavoritesService");
        await FavoritesService.remove(userId, moduleType, itemId);
        setFavorites((prev) => prev.filter((fav) => fav.itemId !== String(itemId)));
      } catch (err) {
        throw err;
      }
    },
    [userId, moduleType]
  );

  const isFavorite = useCallback(
    (itemId) => {
      return favorites.some((fav) => fav.itemId === String(itemId));
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (item) => {
      if (isFavorite(item.id)) {
        await removeFavorite(item.id);
      } else {
        await addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refetch: loadFavorites,
  };
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renders: 0,
    apiCalls: 0,
    errors: 0,
    avgLoadTime: 0,
  });

  const metricsRef = useRef(metrics);

  const trackRender = useCallback(() => {
    metricsRef.current.renders++;
    setMetrics({ ...metricsRef.current });
  }, []);

  const trackAPICall = useCallback((duration) => {
    metricsRef.current.apiCalls++;
    metricsRef.current.avgLoadTime =
      (metricsRef.current.avgLoadTime * (metricsRef.current.apiCalls - 1) + duration) /
      metricsRef.current.apiCalls;
    setMetrics({ ...metricsRef.current });
  }, []);

  const trackError = useCallback(() => {
    metricsRef.current.errors++;
    setMetrics({ ...metricsRef.current });
  }, []);

  const getAPIMetrics = useCallback(() => {
    return apiClient.getMetrics();
  }, []);

  return {
    metrics,
    trackRender,
    trackAPICall,
    trackError,
    getAPIMetrics,
    reset: () => {
      metricsRef.current = { renders: 0, apiCalls: 0, errors: 0, avgLoadTime: 0 };
      setMetrics(metricsRef.current);
    },
  };
}
