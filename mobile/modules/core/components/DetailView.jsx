import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { COLORS } from "../../../constants/colors";

/**
 * Generic DetailView Component
 * Displays detailed information about any content item based on module configuration
 */
export default function DetailView({ item, detailFields = [], moduleColors = {} }) {
  const primaryColor = moduleColors.primary || COLORS.primary;
  const accentColor = moduleColors.accent || COLORS.accent;

  const renderField = (field, index) => {
    const value = item[field.key];
    if (!value) return null;

    switch (field.type) {
      case "title":
        return (
          <Text key={index} style={[styles.title, { color: primaryColor }]}>
            {value}
          </Text>
        );

      case "text":
        return (
          <View key={index} style={styles.section}>
            {field.label && <Text style={styles.sectionLabel}>{field.label}</Text>}
            <Text style={styles.textContent}>{value}</Text>
          </View>
        );

      case "meta":
        return (
          <View key={index} style={styles.metaRow}>
            {field.icon && <Ionicons name={field.icon} size={20} color={accentColor} />}
            <View style={styles.metaContent}>
              {field.label && <Text style={styles.metaLabel}>{field.label}</Text>}
              <Text style={styles.metaValue}>{value}</Text>
            </View>
          </View>
        );

      case "list":
        return (
          <View key={index} style={styles.section}>
            {field.label && <Text style={styles.sectionLabel}>{field.label}</Text>}
            {Array.isArray(value) &&
              value.map((listItem, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{listItem}</Text>
                </View>
              ))}
          </View>
        );

      case "steps":
        return (
          <View key={index} style={styles.section}>
            {field.label && <Text style={styles.sectionLabel}>{field.label}</Text>}
            {Array.isArray(value) &&
              value.map((step, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepNumber, { backgroundColor: accentColor }]}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Image */}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.mainImage} contentFit="cover" />
      )}

      {/* Content */}
      <View style={styles.content}>
        {detailFields.map((field, index) => renderField(field, index))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainImage: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.cardBackground,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  textContent: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || "#E0E0E0",
  },
  metaContent: {
    marginLeft: 12,
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 12,
    fontWeight: "600",
  },
  listText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  stepText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
});
