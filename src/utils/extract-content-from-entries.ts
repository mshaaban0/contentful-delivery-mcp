import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { Block, Inline } from "@contentful/rich-text-types";

const EXCLUDED_FIELDS = [/slug/i, /url/i, /file/i];

const isFieldRelevant = (field: any): boolean => {
  if (EXCLUDED_FIELDS.some((regex) => regex.test(field.apiName))) {
    return false;
  }

  switch (field.type) {
    case "RichText":
    case "Symbol":
    case "Text":
      return true;
    default:
      return false;
  }
};

const transformFieldValue = (value: unknown, field: any): string => {
  if (!value) return "";

  switch (field.type) {
    case "RichText":
      return documentToPlainTextString(value as Block | Inline);
    case "Symbol":
    case "Text":
      return String(value);
    default:
      return "";
  }
};

export const extractContentFromEntries = (
  entries: any[],
  contentTypes: any[]
): string => {
  let extractedContent = "";

  entries.forEach((entry) => {
    const contentType = contentTypes.find(
      (ct) => ct.sys.id === entry.sys.contentType.sys.id
    );
    if (!contentType)
      throw new Error(
        "Extract Content From Entries: Content type not found for entry"
      );

    const relevantFields = contentType.fields.filter(isFieldRelevant);

    relevantFields.forEach((field: any) => {
      if (!(field.apiName in entry.fields)) return; // Skip if field doesn't exist in entry

      const fieldValue = entry.fields[field.apiName];
      if (!fieldValue) return; // Skip if field value is empty

      // Handle localized content by taking the first locale's value
      const value =
        typeof fieldValue === "object"
          ? Object.values(fieldValue)[0]
          : fieldValue;

      const transformedValue = transformFieldValue(value, field);
      if (transformedValue) {
        extractedContent += `${field.apiName}: ${transformedValue}\n`;
      }
    });

    extractedContent += "\n"; // Add spacing between entries
  });

  return extractedContent.trim();
};
