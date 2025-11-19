// src/lib/utils/arrayHelpers.ts

export const parseStringArray = (str: string | null | undefined): string[] => {
  if (!str || str.trim() === '') return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

export const stringifyArray = (arr: string[]): string => {
  return arr.filter(Boolean).join(',');
};

// استفاده:
// const tags = parseStringArray(transaction.tags);
// const attachments = parseStringArray(transaction.attachments);
