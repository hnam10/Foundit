import {
  Box,
  Circle,
  Flex,
  HStack,
  Text,
  VStack,
  Checkmark,
} from '@chakra-ui/react';
import { getRelativeTime } from '@/utils/relativeDate';

interface NotificationCardProps {
  title: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export default function NotificationCard({
  title,
  message,
  isRead = false,
  createdAt,
}: NotificationCardProps) {
  return (
    <Flex
      w="full"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      borderRadius="sm"
      overflow="hidden"
    >
      <Box w="4px" bg={isRead ? 'transparent' : '#2F80ED'} />
      <HStack w="full" px={6} py={4} gap={4} align="center">
        {/* Read / unread icon */}
        {isRead ? (
          <Circle size="18px" borderWidth="1px" borderColor="gray.500">
            <Checkmark checked size="md" variant="plain" />{' '}
          </Circle>
        ) : (
          <Circle
            size="18px"
            borderWidth="2px"
            borderColor="black"
            bg="white"
          />
        )}

        <VStack align="start" gap={1} flex={1}>
          <Text
            as="a"
            href="#"
            fontSize="sm"
            fontWeight="semibold"
            color="#1a1a1a"
            textDecoration="underline"
          >
            {title}
          </Text>

          <Text fontSize="sm" color="gray.600">
            {message}
          </Text>
        </VStack>

        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          {getRelativeTime(createdAt)}
        </Text>
      </HStack>
    </Flex>
  );
}
