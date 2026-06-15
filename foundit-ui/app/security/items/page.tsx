'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { IoSearch } from 'react-icons/io5';
import { StoredItemCard } from '@/components/items/StoredItemCard';
import { fetchCampuses, fetchSecurityItems } from '@/lib/api/items';
import type { Campus, ItemStatus, SecurityItemListItem } from '@/types/items';
import { ITEM_STATUS_LABELS } from '@/types/items';

const Select = chakra('select');

const ITEM_STATUSES: ItemStatus[] = [
  'pending_report',
  'stored',
  'claimed',
  'expired',
  'disposed',
];

export default function StoredItemsPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [items, setItems] = useState<SecurityItemListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [campusFilter, setCampusFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCampuses() {
      try {
        const data = await fetchCampuses();
        if (active) setCampuses(data);
      } catch {
        // Campus filter is optional; list can still load.
      }
    }

    loadCampuses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchSecurityItems({
          campusId: campusFilter || undefined,
          status: (statusFilter as ItemStatus) || undefined,
          limit: 50,
        });

        if (!active) return;
        setItems(result.data);
        setNextCursor(result.nextCursor);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load stored items.'
        );
        setItems([]);
        setNextCursor(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, [campusFilter, statusFilter]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.itemId.toLowerCase().includes(query) ||
        item.campusName.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError('');

    try {
      const result = await fetchSecurityItems({
        campusId: campusFilter || undefined,
        status: (statusFilter as ItemStatus) || undefined,
        cursor: nextCursor,
        limit: 50,
      });

      setItems((current) => [...current, ...result.data]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more items.'
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          color="gray.900"
        >
          Stored Items
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Please note that lost items will be stored for 30 days only. Unclaimed
          items will be disposed of after this period.
        </Text>
      </Stack>

      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap={4}
        align={{ base: 'stretch', sm: 'center' }}
        flexWrap="wrap"
      >
        <Select
          value={campusFilter}
          onChange={(e) => setCampusFilter(e.target.value)}
          minW={{ sm: '200px' }}
          maxW={{ sm: '240px' }}
          h={10}
          px={3}
          fontSize="sm"
          bg="white"
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius="md"
          color="gray.800"
          _focusVisible={{
            outline: 'none',
            boxShadow: '0 0 0 2px #009adb',
          }}
        >
          <option value="">All campuses</option>
          {campuses.map((campus) => (
            <option key={campus.campusId} value={campus.campusId}>
              {campus.campusName}
            </option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          minW={{ sm: '200px' }}
          maxW={{ sm: '240px' }}
          h={10}
          px={3}
          fontSize="sm"
          bg="white"
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius="md"
          color="gray.800"
          _focusVisible={{
            outline: 'none',
            boxShadow: '0 0 0 2px #009adb',
          }}
        >
          <option value="">All statuses</option>
          {ITEM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ITEM_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

        <Box position="relative" flex={1} maxW={{ sm: '360px' }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items"
            h={10}
            pr={10}
            bg="white"
            borderColor="gray.300"
            _focusVisible={{
              outline: 'none',
              boxShadow: '0 0 0 2px #009adb',
            }}
          />
          <Box
            position="absolute"
            right={3}
            top="50%"
            transform="translateY(-50%)"
            color="gray.500"
            pointerEvents="none"
            aria-hidden
          >
            <IoSearch size={18} />
          </Box>
        </Box>
      </Flex>

      {loading && (
        <Flex justify="center" py={12}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      )}

      {!loading && error && (
        <Text color="red.500" fontSize="sm" py={4} textAlign="center">
          {error}
        </Text>
      )}

      {!loading && !error && (
        <Stack gap={3}>
          {filteredItems.length === 0 ? (
            <Text color="gray.500" fontSize="sm" py={8} textAlign="center">
              No items match your filters.
            </Text>
          ) : (
            filteredItems.map((item) => (
              <StoredItemCard key={item.itemId} item={item} />
            ))
          )}

          {nextCursor && !searchQuery.trim() && (
            <Flex justify="center" pt={2}>
              <Button
                variant="outline"
                onClick={handleLoadMore}
                loading={loadingMore}
                loadingText="Loading"
              >
                Load more
              </Button>
            </Flex>
          )}
        </Stack>
      )}
    </Stack>
  );
}
