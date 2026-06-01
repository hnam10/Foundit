'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { IoSearch } from 'react-icons/io5';
import { StoredItemCard } from '@/components/items/StoredItemCard';
import { CAMPUSES } from '@/constants/campuses';
import { MOCK_STORED_ITEMS } from '@/constants/mockStoredItems';

const Select = chakra('select');

export default function StoredItemsPage() {
  const [campusFilter, setCampusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MOCK_STORED_ITEMS.filter((item) => {
      const matchesCampus = !campusFilter || item.campusId === campusFilter;

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        String(item.id).includes(query) ||
        item.campusName.toLowerCase().includes(query);

      return matchesCampus && matchesSearch;
    });
  }, [campusFilter, searchQuery]);

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
          <option value="">Campus Option</option>
          {CAMPUSES.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </Select>

        <Box position="relative" flex={1} maxW={{ sm: '360px' }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=""
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

      <Stack gap={3}>
        {filteredItems.length === 0 ? (
          <Text color="gray.500" fontSize="sm" py={8} textAlign="center">
            No items match your filters.
          </Text>
        ) : (
          filteredItems.map((item) => (
            <StoredItemCard key={item.id} item={item} />
          ))
        )}
      </Stack>
    </Stack>
  );
}
