export type StoredItemStatus =
  | 'received'
  | 'under_review'
  | 'approved'
  | 'picked_up';

export interface StoredItem {
  id: number;
  category: string;
  name: string;
  campusId: string;
  campusName: string;
  date: string;
  status: StoredItemStatus;
  imageUrl?: string;
}

export const MOCK_STORED_ITEMS: StoredItem[] = [
  {
    id: 45,
    category: 'Electronic',
    name: 'Phone',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-20',
    status: 'received',
    imageUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&h=120&fit=crop',
  },
  {
    id: 456,
    category: 'Electronic',
    name: 'Mouse',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-18',
    status: 'approved',
    imageUrl:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=120&h=120&fit=crop',
  },
  {
    id: 311,
    category: 'Clothing',
    name: 'Jacket',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-18',
    status: 'under_review',
    imageUrl:
      'https://images.unsplash.com/photo-1551028711-00167b16eac5?w=120&h=120&fit=crop',
  },
  {
    id: 333,
    category: 'Clothing',
    name: 'Hoodie',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-18',
    status: 'under_review',
    imageUrl:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=120&h=120&fit=crop',
  },
  {
    id: 455,
    category: 'Clothing',
    name: 'Hoodie',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-18',
    status: 'picked_up',
    imageUrl:
      'https://images.unsplash.com/photo-1578587018453-892bacefd3f2?w=120&h=120&fit=crop',
  },
  {
    id: 123,
    category: 'Clothing',
    name: 'Hoodie',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-18',
    status: 'picked_up',
  },
  {
    id: 222,
    category: 'Clothing',
    name: 'Hoodie',
    campusId: 'newnham',
    campusName: 'Newnham',
    date: '2026-01-18',
    status: 'picked_up',
  },
];
