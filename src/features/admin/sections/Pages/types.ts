// Define the structure for a single Page
export interface Page {
  id?: string; // Optional ID, usually added when fetched or after creation
  title: string;
  slug: string; // URL-friendly identifier
  content: string; // Page content (e.g., Markdown, HTML)
  order: number; // Add order field
}