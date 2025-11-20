import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moduleRegistry } from "../ModuleRegistry";
import { searchAllModules, getModuleStats } from "../../index";
import { COLORS } from "../../../constants/colors";
import ContentCard from "./ContentCard";

/**
 * Central Hub - Main navigation and control center
 * Optimized for performance with memoization and lazy loading
 */
export default function CentralHub({ userId, onModuleSelect, initialModule = "recipes" }) {
  const [activeModule, setActiveModule] = useState(initialModule);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Get all modules
  const modules = useMemo(() => moduleRegistry.getAll(), []);

  // Update stats
  useEffect(() => {
    setStats(getModuleStats());
  }, [modules]);

  // Handle module selection
  const handleModuleSelect = (moduleId) => {
    setActiveModule(moduleId);
    moduleRegistry.setActive(moduleId);
    setGlobalSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    onModuleSelect?.(moduleId);
  };

  // Handle global search
  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchAllModules(searchQuery, { limit: 5 });
      setSearchResults(results);
      setGlobalSearch(true);
    } catch (error) {
      console.error("Global search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setGlobalSearch(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Content Hub</Text>
          <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.statsButton}>
            <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Panel */}
        {showStats && stats && (
          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Modules</Text>
              <Text style={styles.statValue}>{stats.totalModules}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={styles.statValue}>{stats.activeModule}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Categories</Text>
              <Text style={styles.statValue}>{stats.availableCategories}</Text>
            </View>
          </View>
        )}

        {/* Global Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search across all modules..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleGlobalSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Module Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.moduleSelector}
        contentContainerStyle={styles.moduleSelectorContent}
      >
        {modules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={[
              styles.moduleChip,
              activeModule === module.id && styles.moduleChipActive,
              { borderColor: module.colors?.primary || COLORS.primary },
            ]}
            onPress={() => handleModuleSelect(module.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={module.icon}
              size={20}
              color={activeModule === module.id ? "#FFFFFF" : module.colors?.primary || COLORS.primary}
            />
            <Text
              style={[
                styles.moduleChipText,
                activeModule === module.id && styles.moduleChipTextActive,
              ]}
            >
              {module.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Global Search Results */}
      {globalSearch && (
        <ScrollView style={styles.searchResults}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Searching all modules...</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
            </View>
          ) : (
            <>
              {searchResults.map((moduleResult) => (
                <View key={moduleResult.moduleId} style={styles.moduleResults}>
                  <View style={styles.moduleResultsHeader}>
                    <Ionicons
                      name={modules.find((m) => m.id === moduleResult.moduleId)?.icon || "apps-outline"}
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.moduleResultsTitle}>{moduleResult.moduleName}</Text>
                    <Text style={styles.moduleResultsCount}>({moduleResult.count})</Text>
                  </View>
                  {moduleResult.results.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      moduleId={moduleResult.moduleId}
                      cardFields={modules.find((m) => m.id === moduleResult.moduleId)?.cardFields}
                    />
                  ))}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.cardBackground,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || "#E0E0E0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
  },
  statsButton: {
    padding: 8,
  },
  statsPanel: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  moduleSelector: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || "#E0E0E0",
  },
  moduleSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  moduleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: COLORS.cardBackground,
    marginRight: 8,
  },
  moduleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  moduleChipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  moduleChipTextActive: {
    color: "#FFFFFF",
  },
  searchResults: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  moduleResults: {
    marginVertical: 8,
  },
  moduleResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
  },
  moduleResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },
  moduleResultsCount: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
});
