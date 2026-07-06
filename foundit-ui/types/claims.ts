import type { SecurityItemImage } from '@/types/items';

export type ApiClaimStatus =
  | 'submitted'
  | 'match_found'
  | 'match_confirmed'
  | 'approved'
  | 'rejected'
  | 'picked_up'
  | 'under_review';

export interface SecurityClaimListItem {
  claimId: string;
  studentId: string;
  itemId: string | null;
  category: string;
  campusId: string;
  description: string;
  dateLost: string | null;
  locationLost: string | null;
  status: ApiClaimStatus;
  reviewedAt: string | null;
  rejectionReason: string | null;
  pickedUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    studentNumber: string | null;
  };
  item: {
    itemId: string;
    campusId: string;
    category: string;
    title: string;
    status: string;
    brand: string | null;
    color: string | null;
    locationFound: string | null;
    dateFound: string;
  } | null;
}

export interface SecurityClaimDetail extends SecurityClaimListItem {
  images: SecurityItemImage[];
  reviewedBy: string | null;
  verifiedBy: string | null;
  reviewer: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  verifier: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface SecurityClaimListResponse {
  data: SecurityClaimListItem[];
  nextCursor: string | null;
}

export type MatchSuggestionStatus =
  | 'suggested'
  | 'confirmed'
  | 'rejected'
  | 'dismissed';

export interface MatchSuggestion {
  matchId: string;
  claimId: string;
  itemId: string;
  matchScore: number;
  matchCriteria: string | null;
  status: MatchSuggestionStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  item: {
    itemId: string;
    campusId: string;
    category: string;
    title: string;
    status: string;
    brand: string | null;
    color: string | null;
    locationFound: string | null;
    dateFound: string;
    descriptionPublic: string | null;
  };
  reviewer: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}
