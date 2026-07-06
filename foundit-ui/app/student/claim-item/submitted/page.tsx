'use client';

import Link from 'next/link';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { ROLE_HOME } from '@/utils/routes';

// Confirmation screen the student lands on after a successful claim submit
// (useClaimItemForm pushes CLAIM_SUBMITTED_PATH). Mirrors the
// report-found/submitted pattern, but lives under app/student/ so it inherits
// RoleShell and the student-role gate, and reuses claim-item's fixed hero
// background so the transition from the form feels seamless.
export default function ClaimSubmittedPage() {
  return (
    <>
      {/* Same full-bleed hero as app/student/claim-item/page.tsx. */}
      <Box
        position="fixed"
        inset={0}
        backgroundImage="url('/bg.svg')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        zIndex={0}
      />
      <Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={0} />

      <Box
        position="relative"
        zIndex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={8}
      >
        <Heading
          as="h1"
          color="white"
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="bold"
          textAlign="center"
        >
          Claim Your Lost Item
        </Heading>

        <Stack
          bg="white"
          rounded="md"
          shadow="md"
          maxW="985px"
          w="full"
          minH="420px"
          p={{ base: 6, md: 12 }}
          gap={2}
        >
          {/* Heading stays pinned at the top, centered; the body centers in
              the remaining card space below. */}
          <Heading
            fontSize="40px"
            color="black"
            fontWeight="bold"
            textAlign="center"
          >
            Claim Submitted!
          </Heading>

          {/* Body centers in the space left under the heading. */}
          <Stack
            flex={1}
            align="center"
            justify="center"
            textAlign="center"
            gap={6}
          >
            <Stack gap={4} align="center" maxW="700px">
              <Text color="fg.muted">
                Your claim has been received and is now under review.
              </Text>
              <Text color="fg.muted">
                Our security team will verify the details and contact you once
                there is an update.
              </Text>
            </Stack>

            <Button asChild colorPalette="blue" size="lg" mt={2}>
              <Link href={ROLE_HOME.student}>Back to Dashboard</Link>
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
