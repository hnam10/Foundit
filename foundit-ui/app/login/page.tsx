'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import TextInput from '../../components/TextInput';
import { Box, Button, Stack, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ST } from 'next/dist/shared/lib/utils';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleLogin() {
    setEmailError('');
    setPasswordError('');

    if (!email) setEmailError('Please enter your email.');
    if (!password) setPasswordError('Please enter your password.');

    if (!email || !password) return;

    router.push('/dashboard');
  }

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
        <Navbar variant="student" />

        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Stack
            bg="white"
            p={8}
            rounded="md"
            shadow="md"
            w="532px"
            gap={4}
            align="stretch"
            padding={85}
          >
            <Heading fontSize="40px" textAlign="center" color="#1a1a1a">
              Login
            </Heading>
            <Stack gap="20px" alignItems="center" pt={62} pb={62}>
              <TextInput
                placeholder="example@myseneca.ca"
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                width="full"
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
              />

              <TextInput
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
              />
            </Stack>
            <Button
              w="172px"
              h="48px"
              rounded="12px"
              fontSize="16px"
              colorPalette="blue"
              onClick={handleLogin}
              alignSelf="center"
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
