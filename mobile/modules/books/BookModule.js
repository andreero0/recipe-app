import { BookAPIAdapter } from "./BookAPIAdapter";

/**
 * Book Module Configuration
 */
export const BookModule = {
  id: "books",
  name: "Books",
  icon: "book-outline",
  apiAdapter: new BookAPIAdapter(),

  // Card display configuration
  cardFields: [
    { key: "title", type: "title" },
    { key: "authors", type: "meta", icon: "person-outline" },
    { key: "description", type: "description" },
    { key: "publishedDate", type: "footer", icon: "calendar-outline" },
    { key: "pageCount", type: "footer", icon: "document-text-outline" },
  ],

  // Detail view configuration
  detailFields: [
    { key: "title", type: "title" },
    { key: "authors", type: "meta", icon: "person-outline", label: "Author(s)" },
    { key: "description", type: "text" },
    { key: "publisher", type: "meta", icon: "business-outline", label: "Publisher" },
    { key: "publishedDate", type: "meta", icon: "calendar-outline", label: "Published" },
    { key: "pageCount", type: "meta", icon: "document-text-outline", label: "Pages" },
    { key: "categories", type: "meta", icon: "pricetag-outline", label: "Categories" },
    { key: "rating", type: "meta", icon: "star-outline", label: "Rating" },
    { key: "language", type: "meta", icon: "language-outline", label: "Language" },
    { key: "isbn", type: "meta", icon: "barcode-outline", label: "ISBN" },
  ],

  // Module-specific colors
  colors: {
    primary: "#4A90E2", // Book blue
    accent: "#F5A623", // Gold for highlights
  },

  // Schema for database storage
  schema: {
    id: "string",
    title: "string",
    description: "string",
    image: "string",
    authors: "string",
    publisher: "string",
    publishedDate: "string",
    pageCount: "string",
    categories: "string",
    rating: "string",
    language: "string",
    isbn: "string",
  },
};
