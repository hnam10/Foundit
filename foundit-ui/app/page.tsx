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
      <Stack
        bg="bg"
        rounded="xl"
        shadow="md"
        p={12}
        w="full"
        maxW="md"
        minH="55vh"
        justify="space-between"
        alignItems="center"
        textAlign="center"
      >
        <Heading size="4xl">Welcome to FoundIt</Heading>

        <Text color="fg.muted" fontSize="sm">
          Please login to your account to continue
        </Text>

        <Button px={16} colorPalette="red" onClick={handleSignIn}>
          Login
        </Button>

        <Stack gap={1} fontSize="sm">
          <Text fontWeight="medium">Lost and found office hours:</Text>
          <Text color="fg.muted">Mon. to Fri. 9:00 AM - 5:00 PM</Text>
        </Stack>
      </Stack>
    </Box>
  );
}
