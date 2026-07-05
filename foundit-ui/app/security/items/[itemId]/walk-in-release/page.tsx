'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Field,
  Flex,
  Grid,
  Heading,
  Image,
  Input,
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { ItemStatusBadge } from '@/components/items/ItemStatusProgress';
import { Button } from '@/components/ui/Button';
import FieldError from '@/components/FieldError';
import { MOCK_SECURITY_DISPLAY_NAME } from '@/constants/mockSession';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';
import { fetchSecurityItem, walkInReleaseItem } from '@/lib/api/items';
import type { SecurityItemDetail } from '@/types/items';
import { ITEM_STATUS_LABELS } from '@/types/items';

const PLACEHOLDER = '—';

const inputStyles = {
  h: 9,
  px: 3,
  fontSize: 'sm',
  color: '#1a1a1a',
  bg: 'white',
  borderWidth: '1px',
  borderRadius: 'md',
  borderColor: '#D9D9D9',
  _focusVisible: {
    outline: 'none',
    boxShadow: '0 0 0 2px #009adb',
    borderColor: 'inherit',
  },
} as const;

function formatDate(value: string | null): string {
  if (!value) return PLACEHOLDER;
  return new Date(value).toLocaleDateString('en-CA');
}

function formatReleaseDateTime(date: Date): string {
  return date.toLocaleString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={1}>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color="gray.500"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="sm" color="gray.800">
        {value}
      </Text>
    </Stack>
  );
}

function ReleaseField({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field.Root id={id} required={required} invalid={!!error}>
      <Field.Label
        mb={0.5}
        fontSize="xs"
        fontWeight="semibold"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {label}
        {required ? (
          <Text as="span" color="red.500" ml={0.5}>
            *
          </Text>
        ) : null}
      </Field.Label>
      {children}
      <FieldError error={error} />
    </Field.Root>
  );
}

interface FormState {
  studentFullName: string;
  idVerified: string;
  contactNumber: string;
  verificationNote: string;
}

interface FormErrors {
  studentFullName?: string;
  idVerified?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.studentFullName.trim()) {
    errors.studentFullName = 'Owner full name is required.';
  }

  if (!form.idVerified.trim()) {
    errors.idVerified = 'Student ID or government ID checked is required.';
  }

  return errors;
}

export default function WalkInReleasePage() {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const itemId = params?.itemId;

  const releasedBy = useLoggedInDisplayName(MOCK_SECURITY_DISPLAY_NAME);
  const releaseDateTime = useMemo(() => formatReleaseDateTime(new Date()), []);

  const [item, setItem] = useState<SecurityItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState<FormState>({
    studentFullName: '',
    idVerified: '',
    contactNumber: '',
    verificationNote: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!itemId) return;

    let active = true;

    async function loadItem() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchSecurityItem(itemId);
        if (active) setItem(data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load item details.'
        );
        setItem(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItem();
    return () => {
      active = false;
    };
  }, [itemId]);

  function handleFormChange<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError('');
  }

  const canRelease = item?.status === 'stored';

  const formComplete =
    !!form.studentFullName.trim() && !!form.idVerified.trim() && confirmed;

  async function handleSubmit() {
    if (!itemId || !item || !canRelease || submitting) return;

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await walkInReleaseItem(itemId, {
        studentFullName: form.studentFullName.trim(),
        idVerified: form.idVerified.trim(),
        contactNumber: form.contactNumber.trim() || null,
        verificationNote: form.verificationNote.trim() || null,
      });
      router.push('/security/items');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to confirm release.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  if (error || !item) {
    return (
      <Stack gap={4} py={12} align="center">
        <Text color="red.500" fontSize="md">
          {error || 'Item not found.'}
        </Text>
        <Button variant="muted" onClick={() => router.push('/security/items')}>
          Back to List
        </Button>
      </Stack>
    );
  }

  const finderName = item.finder
    ? `${item.finder.firstName} ${item.finder.lastName}`.trim() || PLACEHOLDER
    : PLACEHOLDER;
  const photoUrl = item.images[0]?.imageUrl ?? null;
  const description =
    item.descriptionInternal ?? item.descriptionPublic ?? PLACEHOLDER;

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          color="gray.900"
        >
          Walk-in Release
        </Heading>
        <Text fontSize="sm" color="gray.600" maxW="720px">
          Use this when a student collects an item in person without a prior
          claim. Verify ownership before releasing.
        </Text>
      </Stack>

      {!canRelease ? (
        <Box
          bg="orange.50"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="md"
          px={4}
          py={3}
        >
          <Text fontSize="sm" color="orange.800">
            This item cannot be released — current status is{' '}
            {ITEM_STATUS_LABELS[item.status]}.
          </Text>
        </Box>
      ) : null}

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={6}
        alignItems="stretch"
      >
        <Box
          bg="white"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          p={6}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900">
              Item Summary
            </Heading>
            <ItemStatusBadge status={item.status} />
          </Flex>

          <Flex
            direction={{ base: 'column', sm: 'row' }}
            gap={6}
            align="flex-start"
          >
            <Stack gap={4} flex={1} minW={0}>
              <DetailField label="Item Name" value={item.title} />
              <DetailField label="Category" value={item.category} />
              <DetailField
                label="Date Found"
                value={formatDate(item.dateFound)}
              />
              <DetailField
                label="Location Found"
                value={item.locationFound ?? PLACEHOLDER}
              />
              <DetailField label="Campus" value={item.campusName} />
              <DetailField label="Finder" value={finderName} />
            </Stack>

            <Box
              w={{ base: 'full', sm: '160px' }}
              flexShrink={0}
              h="220px"
              borderRadius="md"
              overflow="hidden"
              bg="gray.100"
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={item.title}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              ) : null}
            </Box>
          </Flex>

          <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.100">
            <DetailField label="Description" value={description} />
          </Box>
        </Box>

        <Box
          bg="white"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.200"
          p={6}
          display="flex"
          flexDirection="column"
        >
          <Heading
            as="h2"
            fontSize="lg"
            fontWeight="bold"
            color="gray.900"
            mb={4}
          >
            Release Details
          </Heading>

          <Stack gap={2} flex={1}>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={2}>
              <ReleaseField
                id="studentFullName"
                label="Owner Full Name"
                required
                error={errors.studentFullName}
              >
                <Input
                  {...inputStyles}
                  value={form.studentFullName}
                  onChange={(e) =>
                    handleFormChange('studentFullName', e.target.value)
                  }
                />
              </ReleaseField>

              <ReleaseField id="contactNumber" label="Contact Number">
                <Input
                  {...inputStyles}
                  value={form.contactNumber}
                  onChange={(e) =>
                    handleFormChange('contactNumber', e.target.value)
                  }
                />
              </ReleaseField>
            </Grid>

            <ReleaseField
              id="idVerified"
              label="Student ID / Government ID Checked"
              required
              error={errors.idVerified}
            >
              <Input
                {...inputStyles}
                value={form.idVerified}
                onChange={(e) => handleFormChange('idVerified', e.target.value)}
              />
            </ReleaseField>

            <ReleaseField id="verificationNote" label="Verification Note">
              <Textarea
                {...inputStyles}
                minH="56px"
                py={2}
                rows={2}
                resize="vertical"
                placeholder="e.g., matched lock screen photo, serial number verified"
                value={form.verificationNote}
                onChange={(e) =>
                  handleFormChange('verificationNote', e.target.value)
                }
              />
            </ReleaseField>

            <Box
              bg="gray.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.100"
              px={3}
              py={2}
            >
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={2}>
                <DetailField label="Released By" value={releasedBy} />
                <DetailField
                  label="Date & Time Released"
                  value={releaseDateTime}
                />
              </Grid>
            </Box>

            <Flex align="flex-start" gap={2} pt={0.5}>
              <input
                type="checkbox"
                id="confirmRelease"
                checked={confirmed}
                disabled={!canRelease}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ marginTop: '3px', flexShrink: 0 }}
              />
              <label
                htmlFor="confirmRelease"
                style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  lineHeight: 1.4,
                  cursor: canRelease ? 'pointer' : 'not-allowed',
                }}
              >
                I confirm this item was handed to the verified owner.
              </label>
            </Flex>
          </Stack>
        </Box>
      </Grid>

      {submitError ? (
        <Text fontSize="sm" color="red.500" textAlign="right">
          {submitError}
        </Text>
      ) : null}

      <Flex justify="flex-end" gap={3} wrap="wrap">
        <Button
          variant="muted"
          onClick={() => router.push(`/security/items/${itemId}`)}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          loading={submitting}
          loadingText="Releasing..."
          disabled={!canRelease || !formComplete || submitting}
          onClick={handleSubmit}
        >
          Confirm Release
        </Button>
      </Flex>
    </Stack>
  );
}
