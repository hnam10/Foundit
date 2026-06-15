'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  NativeSelect,
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { fetchSecurityItem } from '@/lib/api/items';
import { CATEGORIES } from '@/constants/categories';
import type { SecurityItemDetail } from '@/types/items';

const PLACEHOLDER = '—';

function formatDate(value: string | null): string {
  if (!value) return PLACEHOLDER;
  return new Date(value).toLocaleDateString('en-CA');
}

// Date input expects YYYY-MM-DD; reuse the en-CA locale (already YYYY-MM-DD).
function toDateInputValue(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-CA');
}

interface EditForm {
  title: string;
  category: string;
  dateFound: string;
  locationFound: string;
  description: string;
}

const editInputStyles = {
  size: 'sm' as const,
  borderColor: '#D9D9D9',
  borderRadius: 'md',
  _focusVisible: {
    outline: 'none',
    boxShadow: '0 0 0 2px #009adb',
    borderColor: 'inherit',
  },
};

function DetailRow({
  label,
  value,
  valueColor = '#999',
  valueFontSize = '16px',
  valueMaxW,
  input,
}: {
  label: string;
  value: string;
  valueColor?: string;
  valueFontSize?: string;
  valueMaxW?: string;
  // When provided (edit mode), the control replaces the read-only value.
  input?: ReactNode;
}) {
  return (
    <Flex align="flex-start">
      <Text
        flexShrink={0}
        w="145px"
        fontSize="14px"
        fontWeight="medium"
        lineHeight="20px"
        color="#666"
        mt={input ? 1 : 0}
      >
        {label}
      </Text>
      {input ? (
        <Box flex={1} maxW={valueMaxW}>
          {input}
        </Box>
      ) : (
        <Text
          fontSize={valueFontSize}
          lineHeight="24px"
          color={valueColor}
          maxW={valueMaxW}
        >
          {value}
        </Text>
      )}
    </Flex>
  );
}

export default function SecurityItemDetailPage() {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const itemId = params?.itemId;

  const [item, setItem] = useState<SecurityItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);

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

  function handleCancel() {
    router.push('/security/items');
  }

  function handleStartEdit() {
    if (!item) return;
    setForm({
      title: item.title,
      category: item.category,
      dateFound: toDateInputValue(item.dateFound),
      locationFound: item.locationFound ?? '',
      description: item.descriptionPublic ?? item.descriptionInternal ?? '',
    });
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setForm(null);
  }

  function handleFormChange<K extends keyof EditForm>(
    key: K,
    value: EditForm[K]
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  // TODO(backend): no PATCH /api/items/:itemId yet — Save only updates local
  // state so the edit is visible for this session; it does NOT persist.
  function handleSave() {
    if (!item || !form) return;
    setItem({
      ...item,
      title: form.title,
      category: form.category,
      dateFound: form.dateFound,
      locationFound: form.locationFound.trim() || null,
      descriptionPublic: form.description.trim() || null,
    });
    setEditing(false);
    setForm(null);
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
        <Button variant="outline" onClick={handleCancel}>
          Back to items
        </Button>
      </Stack>
    );
  }

  const registrantName =
    `${item.registeredBy.firstName} ${item.registeredBy.lastName}`.trim() ||
    PLACEHOLDER;
  const pickedUp = item.status === 'claimed' ? 'Yes' : 'No';
  const description =
    item.descriptionPublic ?? item.descriptionInternal ?? PLACEHOLDER;
  const photoUrl = item.images[0]?.imageUrl ?? null;

  // ─── NOTES FOR THE TEAM ────────────────────────────────────────────────────
  // Finder name + Finder Contact have no real data source yet (kept UI-only):
  //   • GET /api/items/:itemId does not return them. The path would be
  //     Item -> foundItemReport -> finder (User), exposed via
  //     securityItemDetailSelect, toSecurityItemDetailDto, and SecurityItemDetail.
  //   • Caveat: the report link carries no finder identity — the backend records
  //     the SUBMITTER as the finder (backend/src/routes/reportLinks.ts:326,
  //     finderId: req.user!.user_id), so "Finder" would just equal the
  //     registrant/submitter. There is also no contact column on
  //     found_item_report (closest is user.phone), so "Finder Contact" has no
  //     true source. Decide the real source before wiring these up.
  //   • Same gap is documented on the other side in
  //     app/report-found/[token]/page.tsx ("NOTES FOR THE TEAM").
  // ───────────────────────────────────────────────────────────────────────────
  const finderName = PLACEHOLDER;
  const finderContact = PLACEHOLDER;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="#e5e7eb"
      borderRadius="4px"
      maxW="941px"
      mx="auto"
      pt="48px"
      px="42px"
      pb="44px"
    >
      {/* Header: title + verify note + Release */}
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Heading
          as="h1"
          fontSize="30px"
          fontWeight="bold"
          lineHeight="28px"
          color="#1a1a1a"
        >
          Item Details
        </Heading>
        <Flex align="center" gap="20px" wrap="wrap">
          <Text fontSize="16px" color="#999">
            *Verify student ID before releasing item.
          </Text>
          {/* TODO(backend): no release endpoint yet — placeholder button. */}
          <Button
            w="137px"
            h="42px"
            bg="red.500"
            color="white"
            fontSize="16px"
            fontWeight="medium"
            borderRadius="4px"
            disabled={editing}
          >
            Release
          </Button>
        </Flex>
      </Flex>

      {/* Body: detail fields beside the photo */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        justify="space-between"
        align="flex-start"
        gap={{ base: '40px', lg: '24px' }}
        mt="40px"
      >
        <Stack
          gap={editing ? '24px' : '48px'}
          mt={{ base: 0, lg: '60px' }}
          flex={1}
          minW={0}
        >
          <DetailRow
            label="Item Name"
            value={item.title}
            input={
              editing && form ? (
                <Input
                  {...editInputStyles}
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
              ) : undefined
            }
          />
          <DetailRow
            label="Category"
            value={item.category}
            input={
              editing && form ? (
                <NativeSelect.Root size="sm">
                  <NativeSelect.Field
                    value={form.category}
                    borderColor="#D9D9D9"
                    onChange={(e) =>
                      handleFormChange('category', e.target.value)
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              ) : undefined
            }
          />
          <DetailRow
            label="Date"
            value={formatDate(item.dateFound)}
            valueColor="#666"
            valueFontSize="14px"
            input={
              editing && form ? (
                <Input
                  {...editInputStyles}
                  type="date"
                  value={form.dateFound}
                  onChange={(e) =>
                    handleFormChange('dateFound', e.target.value)
                  }
                />
              ) : undefined
            }
          />
          <DetailRow label="Finder Contact" value={finderContact} />
          <DetailRow
            label="Location"
            value={item.locationFound ?? PLACEHOLDER}
            input={
              editing && form ? (
                <Input
                  {...editInputStyles}
                  value={form.locationFound}
                  onChange={(e) =>
                    handleFormChange('locationFound', e.target.value)
                  }
                />
              ) : undefined
            }
          />
          <DetailRow label="Campus" value={item.campusName} />
        </Stack>

        <Stack gap="20px" flexShrink={0}>
          <Stack gap="4px" fontSize="16px" fontWeight="medium" color="#666">
            <Text lineHeight="24px">Finder: {finderName}</Text>
            <Text lineHeight="24px">Registrant: {registrantName}</Text>
          </Stack>
          <Box
            w="329px"
            maxW="full"
            h="366px"
            borderRadius="8px"
            overflow="hidden"
            bg="gray.200"
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={item.title}
                w="full"
                h="full"
                objectFit="contain"
              />
            ) : null}
          </Box>
        </Stack>
      </Flex>

      {/* Full-width rows below the photo */}
      <Stack gap="48px" mt="40px">
        <DetailRow
          label="Description"
          value={description}
          valueMaxW="609px"
          input={
            editing && form ? (
              <Textarea
                {...editInputStyles}
                rows={3}
                value={form.description}
                onChange={(e) =>
                  handleFormChange('description', e.target.value)
                }
              />
            ) : undefined
          }
        />
        <DetailRow label="Is item picked up?" value={pickedUp} />
      </Stack>

      {/* Actions */}
      <Flex justify="center" gap="26px" mt="64px">
        <Button
          variant="outline"
          w="155px"
          h="42px"
          borderColor="#ddd"
          color="#666"
          fontSize="16px"
          fontWeight="medium"
          borderRadius="4px"
          onClick={editing ? handleCancelEdit : handleCancel}
        >
          Cancel
        </Button>
        {/* TODO(backend): no PATCH /api/items/:itemId yet — Save updates local
            state only (no persistence). See handleSave. */}
        <Button
          w="155px"
          h="42px"
          bg="#3b82f6"
          color="white"
          fontSize="16px"
          fontWeight="medium"
          borderRadius="4px"
          onClick={editing ? handleSave : handleStartEdit}
        >
          {editing ? 'Save' : 'Edit'}
        </Button>
      </Flex>
    </Box>
  );
}
