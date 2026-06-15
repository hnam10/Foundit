/**
 * Category options for the Report Found Item form.
 * The backend column (`Item.category` / `FoundItemReport.category`) is free-text
 * varchar(50), so these values are a product choice — keep each ≤ 50 chars.
 */
export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Bags & Luggage',
  'Books & Stationery',
  'IDs & Cards',
  'Keys',
  'Wallets & Purses',
  'Jewelry & Accessories',
  'Water Bottles',
  'Other',
] as const;
