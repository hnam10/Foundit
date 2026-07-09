import type { ApiClaimStatus, SecurityClaimListItem } from '@/types/claims';

export type ClaimDetailMode = 'awaiting' | 'review' | 'post_match' | 'terminal';

export type WorkflowStepState = 'complete' | 'active' | 'pending';

export interface ClaimWorkflowStep {
  key: string;

  label: string;

  description: string;

  state: WorkflowStepState;

  timestamp?: string | null;
}

export interface ClaimDisplayStatus {
  label: string;

  colorPalette: string;

  strip: string;

  color: string;
}

type ClaimPhaseInput = Pick<SecurityClaimListItem, 'status' | 'itemId'>;

/** @deprecated Legacy rows only — new code writes `under_review`. */

export function isLegacyMatchFound(status: ApiClaimStatus): boolean {
  return status === 'match_found';
}

/** @deprecated Legacy rows only — new code writes `under_review` + itemId. */

export function isLegacyMatchConfirmed(status: ApiClaimStatus): boolean {
  return status === 'match_confirmed';
}

export function claimHasLinkedItem(claim: ClaimPhaseInput): boolean {
  return Boolean(claim.itemId) || isLegacyMatchConfirmed(claim.status);
}

/** Security must confirm an AI-suggested or manually identified match. */

export function claimAwaitingMatchConfirmation(
  claim: ClaimPhaseInput
): boolean {
  if (claimHasLinkedItem(claim)) return false;

  if (isLegacyMatchFound(claim.status)) return true;

  return claim.status === 'under_review' && !claim.itemId;
}

/** Match confirmed; student schedules pickup. */

export function claimWaitingOnStudent(claim: ClaimPhaseInput): boolean {
  return (
    (claim.status === 'under_review' && Boolean(claim.itemId)) ||
    isLegacyMatchConfirmed(claim.status)
  );
}

export function getClaimItemName(claim: SecurityClaimListItem): string {
  if (claim.item?.title) return claim.item.title;

  const trimmed = claim.description.trim();

  if (!trimmed) return 'Lost item claim';

  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

export function formatClaimDate(value: string | null): string {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',

    month: 'short',

    day: 'numeric',
  });
}

export function formatClaimId(claimId: string): string {
  return claimId.slice(0, 8).toUpperCase();
}

const terminalDisplay: ClaimDisplayStatus = {
  label: 'Closed',

  colorPalette: 'red',

  strip: 'red.500',

  color: 'red.700',
};

const statusDisplay: Partial<
  Record<ApiClaimStatus, Omit<ClaimDisplayStatus, 'label'> & { label: string }>
> = {
  submitted: {
    label: 'Unmatched',

    colorPalette: 'gray',

    strip: 'gray.400',

    color: 'gray.600',
  },

  approved: {
    label: 'Pickup Pending',

    colorPalette: 'orange',

    strip: 'orange.500',

    color: 'orange.700',
  },

  picked_up: {
    label: 'Complete',

    colorPalette: 'green',

    strip: 'green.500',

    color: 'green.700',
  },

  rejected: terminalDisplay,
};

export type ClaimSecurityQueue = 'action' | 'waiting' | 'closed';

/** Tells security whether they need to act, wait, or ignore. */

export function getClaimSecurityQueue(
  claim: ClaimPhaseInput
): ClaimSecurityQueue {
  const { status } = claim;

  if (status === 'picked_up' || status === 'rejected') {
    return 'closed';
  }

  if (status === 'approved' || claimAwaitingMatchConfirmation(claim)) {
    return 'action';
  }

  if (status === 'submitted') {
    return 'action';
  }

  if (claimWaitingOnStudent(claim)) {
    return 'waiting';
  }

  return 'waiting';
}

export function getClaimSecurityActionHint(claim: ClaimPhaseInput): string {
  const { status } = claim;

  if (claimAwaitingMatchConfirmation(claim)) {
    return 'Review AI matches and confirm the correct stored item.';
  }

  if (claimWaitingOnStudent(claim)) {
    return 'No action needed until the student schedules a pickup appointment.';
  }

  switch (status) {
    case 'submitted':
      return 'No item linked yet. Review matches or search stored items.';

    case 'approved':
      return 'At pickup: verify student ID, confirm ownership, and release the item.';

    case 'picked_up':
      return 'This claim is finished.';

    case 'rejected':
      return 'This claim was closed without a release.';

    default:
      return 'No action needed right now.';
  }
}

export function claimNeedsSecurityAction(claim: ClaimPhaseInput): boolean {
  return getClaimSecurityQueue(claim) === 'action';
}

/** Maps API claim status to list/detail badge labels. */

export function getClaimDisplayStatus(
  claim: ClaimPhaseInput
): ClaimDisplayStatus {
  if (claimAwaitingMatchConfirmation(claim)) {
    return {
      label: 'Match Pending',

      colorPalette: 'yellow',

      strip: 'yellow.500',

      color: 'yellow.700',
    };
  }

  if (claimWaitingOnStudent(claim)) {
    return {
      label: 'Appointment Pending',

      colorPalette: 'teal',

      strip: 'teal.500',

      color: 'teal.700',
    };
  }

  const display = statusDisplay[claim.status];

  if (display) return display;

  return {
    label: 'Under Review',

    colorPalette: 'blue',

    strip: 'blue.500',

    color: 'blue.700',
  };
}

export function getClaimStatusExplanation(claim: ClaimPhaseInput): string {
  const hint = getClaimSecurityActionHint(claim);

  const queue = getClaimSecurityQueue(claim);

  if (queue === 'action') {
    return `Your action: ${hint}`;
  }

  if (queue === 'waiting' && claimWaitingOnStudent(claim)) {
    return `Waiting on student: ${hint}`;
  }

  return hint;
}

export interface ClaimCardStatus {
  label: string;

  strip: string;

  color: string;
}

export function getClaimCardStatus(
  claim: Pick<SecurityClaimListItem, 'status' | 'itemId'>
): ClaimCardStatus {
  const { label, strip, color } = getClaimDisplayStatus(claim);

  return { label, strip, color };
}

export function getClaimDetailMode(
  claim: ClaimPhaseInput,

  suggestionCount: number
): ClaimDetailMode {
  if (claim.status === 'picked_up' || claim.status === 'rejected') {
    return 'terminal';
  }

  if (claimHasLinkedItem(claim) || claim.status === 'approved') {
    return 'post_match';
  }

  if (claimAwaitingMatchConfirmation(claim) || suggestionCount > 0) {
    return 'review';
  }

  return 'awaiting';
}

export function getClaimWorkflowSteps(
  claim: Pick<
    SecurityClaimListItem,
    'status' | 'itemId' | 'reviewedAt' | 'pickedUpAt' | 'updatedAt'
  >,

  suggestionCount: number
): ClaimWorkflowStep[] {
  const { status } = claim;

  const isPickedUp = status === 'picked_up';

  const isRejected = status === 'rejected';

  const isTerminal = isPickedUp || isRejected;

  const isApproved = status === 'approved';

  const isMatchConfirmed = claimHasLinkedItem(claim);

  const hasSuggestions =
    claimAwaitingMatchConfirmation(claim) || suggestionCount > 0;

  const matchStepState: WorkflowStepState =
    isMatchConfirmed || isApproved || isPickedUp
      ? 'complete'
      : hasSuggestions
        ? 'active'
        : 'pending';

  const appointmentState: WorkflowStepState =
    isPickedUp || isApproved
      ? 'complete'
      : isMatchConfirmed
        ? 'active'
        : 'pending';

  const verifyState: WorkflowStepState = isPickedUp
    ? 'complete'
    : isApproved
      ? 'active'
      : 'pending';

  const closedState: WorkflowStepState = isTerminal ? 'complete' : 'pending';

  return [
    {
      key: 'match_found',

      label: 'Match Found',

      description:
        isMatchConfirmed || isApproved || isPickedUp
          ? 'Stored item linked.'
          : hasSuggestions
            ? 'Review suggested matches below.'
            : 'No matches identified yet.',

      state: matchStepState,

      timestamp: isMatchConfirmed ? claim.reviewedAt : null,
    },

    {
      key: 'appointment',

      label: 'Appointment',

      description: isPickedUp
        ? 'Pickup appointment completed.'
        : isApproved
          ? 'Pickup appointment scheduled.'
          : isMatchConfirmed
            ? 'Waiting for student to schedule.'
            : 'Student notified after match is confirmed.',

      state: appointmentState,
    },

    {
      key: 'verify_release',

      label: 'Pickup',

      description: isPickedUp
        ? 'Item released to student.'
        : isApproved
          ? 'Ready for student pickup.'
          : 'Pending appointment.',

      state: verifyState,

      timestamp: claim.pickedUpAt,
    },

    {
      key: 'claim_closed',

      label: isRejected ? 'Rejected' : 'Closed',

      description: isRejected
        ? 'Closed without release.'
        : isPickedUp
          ? 'Item returned to student.'
          : 'Closes after pickup or rejection.',

      state: closedState,

      timestamp: isTerminal ? claim.updatedAt : null,
    },
  ];
}

export function formatClaimDateTime(value: string | null): string {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-US', {
    month: 'short',

    day: 'numeric',

    year: 'numeric',

    hour: 'numeric',

    minute: '2-digit',
  });
}

export function buildManualSearchHref(claim: SecurityClaimListItem): string {
  const params = new URLSearchParams();

  if (claim.campusId) params.set('campusId', claim.campusId);

  if (claim.category) params.set('category', claim.category);

  const trimmed = claim.description.trim();

  if (trimmed) params.set('q', trimmed.slice(0, 80));

  const query = params.toString();

  return `/security/items${query ? `?${query}` : ''}`;
}

export function matchesClaimStatusFilter(
  claim: ClaimPhaseInput,

  filter: string
): boolean {
  if (!filter) return true;

  switch (filter) {
    case 'needs_action':
      return getClaimSecurityQueue(claim) === 'action';

    case 'waiting_on_student':
      return claimWaitingOnStudent(claim);

    case 'completed':
      return getClaimSecurityQueue(claim) === 'closed';

    case 'pending':
      return getClaimSecurityQueue(claim) !== 'closed';

    case 'approved':
      return claim.status === 'approved' || claim.status === 'picked_up';

    case 'rejected':
      return claim.status === 'rejected';

    default:
      return true;
  }
}
