'use client';

import { Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormTextInput from '@/components/FormTextInput';
import SelectInput from '@/components/SelectInput';
import TextAreaInput from '@/components/TextAreaInput';
import ImageUploadGallery from '@/components/uploadImage';
import { LuCircleAlert } from 'react-icons/lu';
import { CATEGORIES } from '@/constants/categories';
import { useClaimItemForm } from '@/hooks/useClaimItemForm';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';
import { getAccessToken, getLoggedInUser } from '@/utils/auth';

// ─── NOTES FOR THE TEAM ──────────────────────────────────────────────────────
// Student claim form (Figma nodes 273-891 default / 725-1573 validation).
// Lives OUTSIDE app/student/ on purpose: app/student/layout.tsx wraps children
// in RoleShell (plain Navbar/Footer + max-width gray box), which conflicts with
// this page's full-bleed hero background — same reason report-found lives at
// the top level.
//
// Wired to existing utils:
//   • utils/auth.ts         → getAccessToken (upload + submit), getLoggedInUser
//                             (read-only identity rows)
//   • constants/categories.ts → CATEGORIES for the Item to Claim dropdown
//   • hooks/useClaimItemForm  → state, validation mirroring createClaimSchema,
//                             POST /api/claims
//
// Still stubbed / needs backend work (kept UI-only for now):
//   1. Student ID — LoggedInUser has no student-number field, only the userId
//      UUID, so that is what we display. Swap to a real student number once the
//      user profile carries one.
//   2. Notification preferences + Additional Information — rendered for design
//      parity but NOT sent; createClaimSchema has no matching columns. See the
//      hook's STUB FIELDS note.
//   3. Proof-of-ownership images are staged as Files but never uploaded or
//      sent — POST /api/claims has no image field. Mirror report-found's
//      submit-time handleImageUpload loop once the backend accepts them.
// ─────────────────────────────────────────────────────────────────────────────

export default function ClaimItemPage() {
  const displayName = useLoggedInDisplayName('');

  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative">
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
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <Navbar
          variant="student"
          userName={displayName || undefined}
          activePath="/claim-item"
        />

        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          px={4}
          py={10}
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

          <ClaimForm displayName={displayName} />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack align="flex-start" gap={4}>
      <Text
        w="180px"
        flexShrink={0}
        fontSize="1rem"
        fontWeight="semibold"
        color="#1a1a1a"
      >
        {label}
      </Text>
      <Text fontSize="1rem" color="gray.700" wordBreak="break-all">
        {value}
      </Text>
    </HStack>
  );
}

function ClaimForm({ displayName }: { displayName: string }) {
  const form = useClaimItemForm();
  // Real session data (utils/auth.ts) — the identity rows and the student-only
  // gate the backend enforces. No mock data on this form.
  const accessToken = getAccessToken();
  const user = getLoggedInUser();
  const isStudent = user?.role === 'student';

  return (
    <Stack
      bg="white"
      rounded="md"
      shadow="md"
      maxW="820px"
      w="full"
      p={{ base: 6, md: 10 }}
      gap={6}
    >
      <Heading size="lg" color="gray.900">
        Claim Item
      </Heading>

      {/*
        Read-only identity rows from the design — prefilled from the logged-in
        user, not editable inputs. Student ID shows the userId UUID because the
        session has no student-number field (see notes at top of file).
      */}
      <Stack gap={2}>
        <ReadonlyRow label="Your Name" value={displayName || '—'} />
        <ReadonlyRow label="Student ID" value={user?.userId || '—'} />
        <ReadonlyRow label="Email Address" value={user?.email || '—'} />
      </Stack>

      {!accessToken && (
        <Text fontSize="sm" color="red.600">
          You must be logged in as a student to submit a claim.
        </Text>
      )}

      {accessToken && !isStudent && (
        <Text fontSize="sm" color="red.600">
          Only student accounts can submit claims.
        </Text>
      )}

      <Stack gap={5}>
        {/* STUB — not persisted (no claim column; see notes at top of file). */}
        <FormTextInput
          id="notificationPreference"
          label="Notification preferences"
          placeholder="email"
          value={form.notificationPreference}
          onChange={(e) => form.setNotificationPreference(e.target.value)}
        />

        <SelectInput
          id="category"
          label="Item to Claim"
          required
          options={CATEGORIES}
          placeholder="Select a category"
          value={form.category}
          error={form.errors.category}
          onChange={(e) => {
            form.setCategory(e.target.value);
            form.clearError('category');
          }}
        />

        <TextAreaInput
          id="description"
          label="Describe Your Item"
          required
          stacked
          placeholder="Describe the item — color, brand, size, distinguishing features"
          maxLength={2000}
          value={form.description}
          error={form.errors.description}
          onChange={(e) => {
            form.setDescription(e.target.value);
            form.clearError('description');
          }}
        />

        {/* STUB — not persisted (no claim column; see notes at top of file). */}
        <TextAreaInput
          id="additionalInformation"
          label="Additional Information"
          stacked
          value={form.additionalInformation}
          onChange={(e) => form.setAdditionalInformation(e.target.value)}
        />

        {/* Proof-of-ownership upload — optional, large drop-zone (design). */}
        {accessToken && (
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="#64748b">
                Upload an image showing proof of ownership
              </Text>
              <Text fontSize="1rem" color="blue.500">
                Optional
              </Text>
            </HStack>
            <ImageUploadGallery
              variant="dropzone"
              onChange={(files) => form.setImageFiles(files)}
            />
          </Box>
        )}
      </Stack>

      <Text fontSize="sm" color="#64748b">
        You are subscribing email notification if you do not wish to receive,
        change notification preference in settings.
      </Text>

      {form.submitError && (
        <HStack gap={2} color="red.600">
          <LuCircleAlert size={16} aria-hidden />
          <Text fontSize="sm" fontWeight="medium">
            {form.submitError}
          </Text>
        </HStack>
      )}

      <HStack justify="center" gap={4} pt={2}>
        <Button
          variant="outline"
          borderColor="#D9D9D9"
          w="140px"
          onClick={form.handleCancel}
          disabled={form.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          colorPalette="blue"
          w="140px"
          loading={form.isSubmitting}
          loadingText="Submitting..."
          onClick={form.handleSubmit}
        >
          Submit
        </Button>
      </HStack>
    </Stack>
  );
}
