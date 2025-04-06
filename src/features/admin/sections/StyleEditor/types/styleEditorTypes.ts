// Defines the structure for theme data, often used for applying a full theme object
export interface ThemeData {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  h3TitleColor: string;
  textColor: string;
  backgroundFromColor: string;
  backgroundToColor: string;
  sectionBgColor: string;
  // Potentially add fontFamily here if ThemeData should include it
  // fontFamily?: string;
}

// Defines the structure for the style settings saved in Firestore and used for CSS variables
export interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleColor?: string;
  h3TitleColor?: string;
  textColor?: string;
  backgroundFromColor?: string;
  backgroundToColor?: string;
  sectionBgColor?: string;
}

// Defines the structure for themes saved by the user in Firestore
export interface SavedTheme {
  id: string;
  name: string;
  style: StyleData;
}