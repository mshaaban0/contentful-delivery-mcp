/**
 * Safely serializes Contentful entries by handling circular references
 * and extracting the most relevant fields
 */
export function serializeContentfulResponse(entries: any) {
  const seen = new WeakSet();
  
  const serializer = (key: string, value: any) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        // Return a simplified reference instead of the full circular object
        return { id: value.sys?.id, type: value.sys?.type };
      }
      seen.add(value);
    }
    return value;
  };

  return JSON.stringify(entries, serializer, 2);
}
