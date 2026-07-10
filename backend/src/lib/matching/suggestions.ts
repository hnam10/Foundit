import { ClaimStatus } from '@prisma/client';
import { prisma } from '../../db';
import { generateMatchCandidates } from './matching';

const pendingMatchStatuses = [
  ClaimStatus.submitted,
  ClaimStatus.under_review,
] as const;

export async function refreshClaimMatchSuggestions(
  claimId: string
): Promise<{ candidateCount: number; suggestionCount: number }> {
  const claim = await prisma.claim.findUnique({
    where: { claimId },
    select: { claimId: true, status: true, itemId: true },
  });

  if (
    !claim ||
    claim.itemId ||
    !pendingMatchStatuses.includes(
      claim.status as (typeof pendingMatchStatuses)[number]
    )
  ) {
    return { candidateCount: 0, suggestionCount: 0 };
  }

  const { candidates: scoredCandidates, candidateCount } =
    await generateMatchCandidates(claim.claimId);

  if (scoredCandidates.length > 0) {
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        scoredCandidates.map((candidate) =>
          tx.matchSuggestion.upsert({
            where: {
              claimId_itemId: {
                claimId: claim.claimId,
                itemId: candidate.itemId,
              },
            },
            update: {
              matchScore: candidate.score,
              matchCriteria: candidate.criteria || null,
            },
            create: {
              claimId: claim.claimId,
              itemId: candidate.itemId,
              matchScore: candidate.score,
              matchCriteria: candidate.criteria || null,
            },
          })
        )
      );

      await tx.claim.updateMany({
        where: {
          claimId: claim.claimId,
          status: ClaimStatus.submitted,
        },
        data: { status: ClaimStatus.under_review },
      });
    });
  }

  return {
    candidateCount,
    suggestionCount: scoredCandidates.length,
  };
}

export function scheduleMatchRefreshForCampus(campusId: string) {
  void (async () => {
    try {
      const claims = await prisma.claim.findMany({
        where: {
          campusId,
          itemId: null,
          status: { in: [...pendingMatchStatuses] },
        },
        select: { claimId: true },
      });

      for (const claim of claims) {
        try {
          await refreshClaimMatchSuggestions(claim.claimId);
        } catch (error) {
          console.error('Failed to refresh claim match suggestions', {
            claimId: claim.claimId,
            error,
          });
        }
      }
    } catch (error) {
      console.error('Failed to schedule campus match refresh', {
        campusId,
        error,
      });
    }
  })();
}
