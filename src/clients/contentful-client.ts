import { createClient } from "contentful";

// Parse allowed content type IDs from environment variable, if provided
export const getAllowedContentTypeIds = (): string[] | null => {
  const envValue = process.env.CONTENTFUL_CONTENT_TYPE_IDS;
  if (!envValue) return null;
  
  return envValue.split(',').map(id => id.trim()).filter(id => id.length > 0);
};

export const client = createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
  space: process.env.CONTENTFUL_SPACE_ID || "",
});
