'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FixedPageBackground } from '@/components/PageBackground';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative">
      <FixedPageBackground overlay />
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
            alignItems="center"
            textAlign="center"
          >
            <Stack gap={8} alignItems="center">
              <Heading fontSize="40px" color="black" mb={6}>
                Welcome
              </Heading>

              <Text color="fg.muted" fontSize="14px" fontWeight="normal">
                Please proceed login with your school account
              </Text>

              <Stack gap={2} alignItems="center">
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
                <Button
                  w="172px"
                  h="48px"
                  rounded="12px"
                  fontSize="16px"
                  colorPalette="blue"
                  variant="outline"
                  onClick={() => router.push('/signup')}
                >
                  Sign Up
                </Button>
              </Stack>

              <Stack gap={1}>
                <Text fontSize="13px" fontWeight="normal" color="fg.muted">
                  Lost and found office hours
                </Text>
                <Text fontSize="13px" fontWeight="normal" color="fg.muted">
                  Mon - Fri &nbsp;&nbsp;&nbsp;&nbsp; 9:00AM - 5:00PM
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
