// Helper function to update nested state immutably
export const updateNestedState = (prevState: any, path: (string | number)[], value: string | string[]): any => { // Allow string[]
  if (!path || path.length === 0) {
    return prevState;
  }
  // Use structuredClone for a more robust deep copy if available, otherwise fallback to JSON parse/stringify
  const newState = typeof structuredClone === 'function' ? structuredClone(prevState) : JSON.parse(JSON.stringify(prevState));
  let current: any = newState;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current[key] === undefined || current[key] === null) {
       const nextKeyIsNumber = typeof path[i+1] === 'number';
       current[key] = nextKeyIsNumber ? [] : {};
    }
     if (Array.isArray(current) && typeof key === 'number') {
        // Ensure array is long enough if accessing by index
        while (current.length <= key) {
            current.push(undefined); // Push undefined or null based on expected structure
        }
     } else if (typeof current !== 'object' || current === null) {
        // Prevent trying to access property on non-object in the path
        console.error("Cannot traverse into non-object:", current, "at path segment", key);
        return prevState; // Return original state if path is invalid
     }
    current = current[key];
  }

  const lastKey = path[path.length - 1];
   if (typeof current !== 'object' || current === null) {
       // Ensure the final target is an object or array before setting the property
       console.error("Cannot set property on non-object/array:", current, "at path", path);
       return prevState; // Return original state if target is invalid
   }

   // Handle array index assignment correctly
   if (Array.isArray(current) && typeof lastKey === 'number') {
        while (current.length <= lastKey) {
            current.push(undefined); // Ensure array is long enough
        }
   }

  current[lastKey] = value;
  return newState;
};

// Helper function to get a static display name for a section key
export const getStaticSectionName = (key: string): string => {
  if (!key) return '';
  // Simple formatting: split camelCase and capitalize
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
};