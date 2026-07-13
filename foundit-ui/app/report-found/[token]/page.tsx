'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FixedPageBackground } from '@/components/PageBackground';
import FormTextInput from '@/components/FormTextInput';
import SelectInput from '@/components/SelectInput';
import TextAreaInput from '@/components/TextAreaInput';
import ImageUploadGallery from '@/components/ImageUploadGallery';
import { LuCircleAlert } from 'react-icons/lu';
import { CATEGORIES } from '@/constants/categories';
import { CAMPUSES } from '@/constants/campuses';
import { useReportFoundItemForm } from '@/hooks/useReportFoundItemForm';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';
import { getAccessToken, getLoggedInUser } from '@/utils/auth';

import { API_BASE } from '@/lib/api/client';

// ─── NOTES FOR THE TEAM ──────────────────────────────────────────────────────
// Wired to existing teammate utils:
//   • utils/auth.ts        → getAccessToken (upload + submit Bearer),
//                            getLoggedInUser (identity rows + student gate)
//   • constants/campuses.ts→ CAMPUSES (Campus stub options)
//   • components/ImageUploadGallery.tsx (ImageUploadGallery) + its hook/util chain
//
// Still stubbed / needs backend work (kept UI-only for now):
//   1. Contact Information + Campus — rendered for design parity but NOT sent.
//      • Contact: no column on found_item_report; closest is user.phone (a
//        profile field on the user table, not a per-report contact).
//      • Campus: campusId exists on report_link/user/item (not on the report).
//        The submit route already DERIVES + validates it from the link, so this
//        picker is display-only. See the hook's STUB FIELDS note.
//   2. Finder / Registrant rows — Finder is the logged-in student; Registrant is
//      the security staff who generated the report link (from validate API).
//   3. Campus name can't be resolved from validate().campusId — that's a UUID,
//      but constants/campuses.ts uses slug ids. Needs a campuses lookup endpoint
//      to display the link's actual campus.
//   4. Images are uploaded to R2 on submit and linked to the created item.
// ─────────────────────────────────────────────────────────────────────────────

type ValidateReason = 'available' | 'not_found' | 'used' | 'expired';

interface ValidateResult {
  valid: boolean;
  reason: ValidateReason;
  campusId: string | null;
  expiresAt?: string;
  usedAt?: string;
  registrant?: {
    firstName: string;
    lastName: string;
  } | null;
}

type LinkState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; result: ValidateResult };

export default function ReportFoundItemPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token ?? '';
  const displayName = useLoggedInDisplayName('');
  const [linkState, setLinkState] = useState<LinkState>({ status: 'loading' });
  const accessToken = getAccessToken();

  useEffect(() => {
    if (
      linkState.status !== 'ready' ||
      linkState.result.reason !== 'available'
    ) {
      return;
    }
    if (getAccessToken()) {
      return;
    }

    router.replace(
      `/login?redirect=${encodeURIComponent(`/report-found/${token}`)}`
    );
  }, [linkState, token, router]);

  useEffect(() => {
    let active = true;

    async function run() {
      if (!token) {
        setLinkState({ status: 'error' });
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/report-links/${token}/validate`
        );
        if (!res.ok) {
          if (active) setLinkState({ status: 'error' });
          return;
        }
        const result = (await res.json()) as ValidateResult;
        if (active) setLinkState({ status: 'ready', result });
      } catch {
        if (active) setLinkState({ status: 'error' });
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <PageShell displayName={displayName}>
      {linkState.status === 'loading' && (
        <Flex align="center" justify="center" py={20} w="full">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      )}

      {linkState.status === 'error' && (
        <MessageCard
          title="Something went wrong"
          body="We couldn't check this report link. Please try again later."
        />
      )}

      {linkState.status === 'ready' &&
        linkState.result.reason !== 'available' && (
          <MessageCard {...unavailableCopy(linkState.result.reason)} />
        )}

      {linkState.status === 'ready' &&
        linkState.result.reason === 'available' &&
        (accessToken ? (
          <ReportForm
            token={token}
            finderName={displayName}
            registrantName={formatPersonName(linkState.result.registrant)}
          />
        ) : (
          <Flex align="center" justify="center" py={20} w="full">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ))}
    </PageShell>
  );
}

function unavailableCopy(reason: ValidateReason): {
  title: string;
  body: string;
} {
  switch (reason) {
    case 'used':
      return {
        title: 'Link already used',
        body: 'This report link has already been used to submit a found item.',
      };
    case 'expired':
      return {
        title: 'Link expired',
        body: 'This report link has expired. Please ask security for a new one.',
      };
    case 'not_found':
    default:
      return {
        title: 'Invalid link',
        body: "This report link is invalid or doesn't exist.",
      };
  }
}

function PageShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative">
      <FixedPageBackground overlay />

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
          activePath="/report-found"
        />

        <Box
          flex={1}
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
          px={4}
          py={10}
        >
          {children}
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
        color="fg"
      >
        {label}
      </Text>
      <Text fontSize="1rem" color="gray.700">
        {value}
      </Text>
    </HStack>
  );
}

function MessageCard({ title, body }: { title: string; body: string }) {
  return (
    <Stack
      bg="white"
      rounded="md"
      shadow="md"
      maxW="480px"
      w="full"
      p={{ base: 6, md: 10 }}
      gap={3}
      textAlign="center"
    >
      <Heading size="md" color="gray.900">
        {title}
      </Heading>
      <Text fontSize="sm" color="fg.muted">
        {body}
      </Text>
    </Stack>
  );
}

function formatPersonName(
  person?: { firstName: string; lastName: string } | null
): string {
  if (!person) return '';
  return `${person.firstName} ${person.lastName}`.trim();
}

function ReportForm({
  token,
  finderName,
  registrantName,
}: {
  token: string;
  finderName: string;
  registrantName: string;
}) {
  const form = useReportFoundItemForm(token);
  // Teammate auth utils (utils/auth.ts): token drives upload/submit; the user
  // drives the identity rows and the student-only gate the backend enforces.
  const accessToken = getAccessToken();
  const user = getLoggedInUser();
  const isStudent = user?.role === 'student';

  return (
    <Stack
      bg="white"
      rounded="md"
      shadow="md"
      maxW="720px"
      w="full"
      p={{ base: 6, md: 10 }}
      gap={6}
    >
      <Box>
        <Heading size="lg" color="gray.900">
          Report Found Item
        </Heading>
        <Text fontSize="sm" color="fg.muted" mt={1}>
          Please provide as much detail as possible to help with identification.
        </Text>
      </Box>

      {/*
        Read-only identity rows from the design. Finder is the logged-in student;
        registrant is the security staff who generated the report link.
      */}
      <Stack gap={2}>
        <ReadonlyRow label="Finder" value={finderName || '—'} />
        <ReadonlyRow label="Registrant" value={registrantName || '—'} />
      </Stack>

      {accessToken && !isStudent && (
        <Text fontSize="sm" color="red.600">
          Only student accounts can submit found-item reports.
        </Text>
      )}

      <Stack gap={5}>
        {/* Field order follows the Figma design (node 116-2394). */}
        <FormTextInput
          id="itemName"
          label="Item Name"
          required
          placeholder="e.g., Black Nike Backpack"
          maxLength={100}
          value={form.itemName}
          error={form.errors.itemName}
          onChange={(e) => {
            form.setItemName(e.target.value);
            form.clearError('itemName');
          }}
        />

        <SelectInput
          id="category"
          label="Category"
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

        <FormTextInput
          id="date"
          label="Date"
          required
          type="date"
          max={form.todayISO()}
          value={form.date}
          error={form.errors.date}
          onChange={(e) => {
            form.setDate(e.target.value);
            form.clearError('date');
          }}
        />

        {/* STUB — not persisted (no report column; see notes at top of file). */}
        <FormTextInput
          id="contactInformation"
          label="Contact Information"
          required
          placeholder="Your email or phone number"
          value={form.contactInformation}
          error={form.errors.contactInformation}
          onChange={(e) => {
            form.setContactInformation(e.target.value);
            form.clearError('contactInformation');
          }}
        />

        <FormTextInput
          id="location"
          label="Location"
          required
          placeholder="Where was it lost/found?"
          maxLength={100}
          value={form.location}
          error={form.errors.location}
          onChange={(e) => {
            form.setLocation(e.target.value);
            form.clearError('location');
          }}
        />

        {/* STUB — campus is derived from the link server-side; this is display-only. */}
        <SelectInput
          id="campus"
          label="Campus"
          required
          options={CAMPUSES.map((c) => c.name)}
          placeholder="Select a campus"
          value={form.campusId}
          error={form.errors.campusId}
          onChange={(e) => {
            form.setCampusId(e.target.value);
            form.clearError('campusId');
          }}
        />

        {/* Image + Description span full width with the label above (design). */}
        {accessToken && (
          <Box>
            <Text mb={2} fontSize="1rem" fontWeight="semibold" color="fg">
              Image
            </Text>
            <ImageUploadGallery
              onChange={(images) => form.setImageFiles(images)}
            />
          </Box>
        )}

        <TextAreaInput
          id="description"
          label="Description"
          required
          stacked
          placeholder="Describe the item — color, brand, size, distinguishing features"
          maxLength={1000}
          value={form.description}
          error={form.errors.description}
          onChange={(e) => {
            form.setDescription(e.target.value);
            form.clearError('description');
          }}
        />
      </Stack>

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
          borderColor="border.input"
          w="140px"
          onClick={form.handleCancel}
          disabled={form.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          colorPalette="blue"
          w="140px"
          disabled={form.isSubmitting}
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
