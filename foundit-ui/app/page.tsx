'use client';

import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';

export default function Home() {
  function handleSignIn() {
    // TODO: wire up auth
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.subtle"
    >
      <Box bg="bg" rounded="xl" shadow="md" p={8} w="full" maxW="sm">
        <Stack gap={6} alignItems="center" textAlign="center">
          <Stack gap={1}>
            <Heading size="4xl">Welcome to FoundIt</Heading>
            <Text color="fg.muted" fontSize="sm">
              Please login to your account to continue
            </Text>
          </Stack>
          <Button px={16} colorPalette="red" onClick={handleSignIn}>
            Login
          </Button>
          <Stack gap={0}>
            <Text>Lost and found office hours:</Text>
            <Text>Monday to Friday: 9:00 AM - 5:00 PM</Text>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
