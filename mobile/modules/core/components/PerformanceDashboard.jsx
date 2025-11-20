import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../APIClient";
import { offlineStorage } from "../OfflineStorage";
import { getModuleStats } from "../../index";
import { COLORS } from "../../../constants/colors";

/**
 * Performance Dashboard
 * Real-time monitoring of app performance metrics
 */
export default function PerformanceDashboard({ visible, onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [moduleStats, setModuleStats] = useState(null);

  useEffect(() => {
    if (visible) {
      loadMetrics();
    }
  }, [visible]);

  const loadMetrics = async () => {
    // Get API metrics
    const apiMetrics = apiClient.getMetrics();

    // Get storage info
    const storage = await offlineStorage.getInfo();

    // Get module stats
    const modules = getModuleStats();

    setMetrics(apiMetrics);
    setStorageInfo(storage);
    setModuleStats(modules);
  };

  const clearCache = () => {
    apiClient.clearCache();
    loadMetrics();
  };

  const clearStorage = async () => {
    await offlineStorage.clear();
    loadMetrics();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* API Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Performance</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Total Requests"
                value={metrics?.totalRequests || 0}
                icon="send-outline"
                color="#4CAF50"
              />
              <MetricCard
                label="Cache Hits"
                value={metrics?.hits || 0}
                icon="checkmark-circle-outline"
                color="#2196F3"
              />
              <MetricCard
                label="Cache Misses"
                value={metrics?.misses || 0}
                icon="close-circle-outline"
                color="#FF9800"
              />
              <MetricCard
                label="Errors"
                value={metrics?.errors || 0}
                icon="alert-circle-outline"
                color="#F44336"
              />
              <MetricCard
                label="Hit Rate"
                value={`${((metrics?.hitRate || 0) * 100).toFixed(1)}%`}
                icon="trending-up-outline"
                color="#9C27B0"
              />
              <MetricCard
                label="Avg Response"
                value={`${(metrics?.avgResponseTime || 0).toFixed(0)}ms`}
                icon="time-outline"
                color="#00BCD4"
              />
              <MetricCard
                label="Cache Size"
                value={metrics?.cacheSize || 0}
                icon="layers-outline"
                color="#795548"
              />
            </View>
          </View>

          {/* Storage Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offline Storage</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Total Items"
                value={storageInfo?.totalItems || 0}
                icon="document-text-outline"
                color="#4CAF50"
              />
              <MetricCard
                label="Storage Used"
                value={`${storageInfo?.totalSizeMB || 0}MB`}
                icon="server-outline"
                color="#FF5722"
              />
            </View>

            {/* Top Storage Items */}
            {storageInfo?.items && storageInfo.items.length > 0 && (
              <View style={styles.storageItems}>
                <Text style={styles.subsectionTitle}>Largest Items</Text>
                {storageInfo.items.slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.storageItem}>
                    <Text style={styles.storageItemKey} numberOfLines={1}>
                      {item.key}
                    </Text>
                    <Text style={styles.storageItemSize}>{item.sizeKB}KB</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Module Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Module Statistics</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Total Modules"
                value={moduleStats?.totalModules || 0}
                icon="apps-outline"
                color="#673AB7"
              />
              <MetricCard
                label="Active Module"
                value={moduleStats?.activeModule || "None"}
                icon="radio-button-on-outline"
                color="#3F51B5"
                valueStyle={styles.textValue}
              />
            </View>

            {/* Loaded Modules */}
            {moduleStats?.modules && (
              <View style={styles.modulesList}>
                <Text style={styles.subsectionTitle}>Loaded Modules</Text>
                {moduleStats.modules.map((module) => (
                  <View key={module.id} style={styles.moduleItem}>
                    <Ionicons name={module.icon} size={20} color={COLORS.primary} />
                    <Text style={styles.moduleItemName}>{module.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Clear API Cache</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={clearStorage}
            >
              <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Clear Offline Storage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={loadMetrics}>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Refresh Metrics</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function MetricCard({ label, value, icon, color, valueStyle }) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricCardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || "#E0E0E0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  metricCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 6,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  textValue: {
    fontSize: 14,
  },
  storageItems: {
    marginTop: 12,
  },
  storageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 6,
  },
  storageItemKey: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  storageItemSize: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  modulesList: {
    marginTop: 12,
  },
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 6,
  },
  moduleItemName: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  actionButtonDanger: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
