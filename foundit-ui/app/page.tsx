'use client';

import { Navbar } from '@/components/Navbar';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';

export default function Home() {
  function handleSignIn() {
    // TODO: wire up auth
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative">
      <Box
        position="fixed"
        inset={0}
        backgroundImage="url('/login-bg.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        zIndex={0}
      />
      <Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={0} />
      {/* Content above background */}
      <Box
        position="relative"
        zIndex={1}
        display="flex"
        flexDirection="column"
        minH="100vh"
      >
        <Navbar variant="student" />
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            bg="bg"
            rounded="xl"
            shadow="md"
            p={12}
            w="full"
            maxW="md"
            minH="55vh"
            justify="space-around"
            alignItems="center"
            textAlign="center"
          >
            <Heading size="4xl" color="black">
              Welcome to FoundIt
            </Heading>

            <Text color="fg.muted" fontSize="sm">
              Please login to your account to continue
            </Text>

            <Button px={16} colorPalette="red" onClick={handleSignIn}>
              Login
            </Button>

            <Stack gap={1} fontSize="sm">
              <Text fontWeight="medium" color="black">
                Lost and found office hours:
              </Text>
              <Text color="fg.muted">Mon. to Fri. 9:00 AM - 5:00 PM</Text>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
