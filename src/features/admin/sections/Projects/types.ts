// Define the structure for a single project explicitly
export interface Project { // Added export
  title: string;
  description: string;
  tags: string[];
  link: string;
}

// Define the structure for the 'projects' section, allowing dynamic keys
export interface ProjectsSection { // Added export
  title: string;
  // Index signature to allow any string key for project objects
  // It also allows the 'title' property defined above.
  [key: string]: Project | string;
}