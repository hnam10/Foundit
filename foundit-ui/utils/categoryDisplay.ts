import type { IconType } from 'react-icons';
import {
  IoBagHandleOutline,
  IoBookOutline,
  IoCardOutline,
  IoCubeOutline,
  IoDiamondOutline,
  IoKeyOutline,
  IoPhonePortraitOutline,
  IoShirtOutline,
  IoWalletOutline,
  IoWaterOutline,
} from 'react-icons/io5';
import { CATEGORIES } from '@/constants/categories';

export interface CategoryDisplay {
  icon: IconType;
  accentColor: string;
  iconBg: string;
  iconBadgeBg: string;
}

const CATEGORY_DISPLAY: Record<(typeof CATEGORIES)[number], CategoryDisplay> = {
  Electronics: {
    icon: IoPhonePortraitOutline,
    accentColor: 'blue.600',
    iconBg: 'blue.50',
    iconBadgeBg: 'blue.100',
  },
  Clothing: {
    icon: IoShirtOutline,
    accentColor: 'purple.600',
    iconBg: 'purple.50',
    iconBadgeBg: 'purple.100',
  },
  'Bags & Luggage': {
    icon: IoBagHandleOutline,
    accentColor: 'orange.600',
    iconBg: 'orange.50',
    iconBadgeBg: 'orange.100',
  },
  'Books & Stationery': {
    icon: IoBookOutline,
    accentColor: 'teal.600',
    iconBg: 'teal.50',
    iconBadgeBg: 'teal.100',
  },
  'IDs & Cards': {
    icon: IoCardOutline,
    accentColor: 'cyan.600',
    iconBg: 'cyan.50',
    iconBadgeBg: 'cyan.100',
  },
  Keys: {
    icon: IoKeyOutline,
    accentColor: 'amber.700',
    iconBg: 'amber.50',
    iconBadgeBg: 'amber.100',
  },
  'Wallets & Purses': {
    icon: IoWalletOutline,
    accentColor: 'green.600',
    iconBg: 'green.50',
    iconBadgeBg: 'green.100',
  },
  'Jewelry & Accessories': {
    icon: IoDiamondOutline,
    accentColor: 'pink.600',
    iconBg: 'pink.50',
    iconBadgeBg: 'pink.100',
  },
  'Water Bottles': {
    icon: IoWaterOutline,
    accentColor: 'sky.600',
    iconBg: 'sky.50',
    iconBadgeBg: 'sky.100',
  },
  Other: {
    icon: IoCubeOutline,
    accentColor: 'gray.600',
    iconBg: 'gray.100',
    iconBadgeBg: 'gray.200',
  },
};

const DEFAULT_CATEGORY_DISPLAY: CategoryDisplay = {
  icon: IoCubeOutline,
  accentColor: 'gray.600',
  iconBg: 'gray.100',
  iconBadgeBg: 'gray.200',
};

export function getCategoryDisplay(category: string): CategoryDisplay {
  const normalized = CATEGORIES.find(
    (known) => known.toLowerCase() === category.trim().toLowerCase()
  );

  if (normalized) {
    return CATEGORY_DISPLAY[normalized];
  }

  return DEFAULT_CATEGORY_DISPLAY;
}
