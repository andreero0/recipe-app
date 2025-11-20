import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { COLORS } from "../../../constants/colors";

/**
 * Generic ContentCard Component
 * Can display any type of content based on module configuration
 */
export default function ContentCard({ item, moduleId, cardFields = [] }) {
  const router = useRouter();

  // Default card fields if not specified
  const defaultFields = [
    { key: "title", icon: null, type: "title" },
    { key: "description", icon: null, type: "description" },
  ];

  const fields = cardFields.length > 0 ? cardFields : defaultFields;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/content/${moduleId}/${item.id}`)}
      activeOpacity={0.8}
    >
      {item.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
      )}

      <View style={styles.content}>
        {fields.map((field, index) => {
          const value = item[field.key];
          if (!value) return null;

          // Title field
          if (field.type === "title") {
            return (
              <Text key={index} style={styles.title} numberOfLines={2}>
                {value}
              </Text>
            );
          }

          // Description field
          if (field.type === "description") {
            return (
              <Text key={index} style={styles.description} numberOfLines={2}>
                {value}
              </Text>
            );
          }

          // Metadata field with icon
          if (field.type === "meta") {
            return (
              <View key={index} style={styles.metaContainer}>
                {field.icon && (
                  <Ionicons name={field.icon} size={14} color={COLORS.textLight} />
                )}
                <Text style={styles.metaText}>{value}</Text>
              </View>
            );
          }

          return null;
        })}

        {/* Footer metadata */}
        <View style={styles.footer}>
          {fields
            .filter((f) => f.type === "footer")
            .map((field, index) => {
              const value = item[field.key];
              if (!value) return null;

              return (
                <View key={index} style={styles.footerItem}>
                  {field.icon && (
                    <Ionicons name={field.icon} size={14} color={COLORS.textLight} />
                  )}
                  <Text style={styles.footerText}>{value}</Text>
                </View>
              );
            })}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.background,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
});
