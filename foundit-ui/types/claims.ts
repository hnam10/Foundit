export type ApiClaimStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'picked_up';

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
