'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function SignupSuccessPage() {
  const router = useRouter();

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
        display="flex"
        flexDirection="column"
        minH="100vh"
      >
        <Navbar variant="guest" />

        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            bg="bg"
            rounded="md"
            shadow="md"
            p={8}
            w="380px"
            minH="235px"
            alignItems="center"
            textAlign="center"
          >
            <Heading fontSize="40px" color="black" mb={6}>
              Welcome
            </Heading>

            <Text mb={12} color="#666666" pt={10}>
              Your account is now verified.
              <br />
              Please log in to continue.
            </Text>

            <Button
              w="172px"
              h="48px"
              rounded="12px"
              fontSize="16px"
              colorPalette="blue"
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          </Stack>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
