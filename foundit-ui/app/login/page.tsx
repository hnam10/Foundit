'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import TextInput from '../../components/TextInput';
import { Box, Button, Stack, Heading, Link, Text } from '@chakra-ui/react';
import { useLoginForm } from '../../hooks/useLoginForm';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    handleEmailBlur,
    handleLogin,
  } = useLoginForm(redirectTo);

  return (
    // A real <form> so Enter submits from either field (and password
    // managers recognize the login form).
    <Stack
      as="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
      }}
      bg="white"
      p={8}
      my={12}
      rounded="md"
      shadow="md"
      w="532px"
      gap={4}
      align="stretch"
      padding={85}
    >
      <Heading fontSize="40px" textAlign="center" color="fg">
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
          onBlur={handleEmailBlur}
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
        type="submit"
        w="172px"
        h="48px"
        rounded="12px"
        fontSize="16px"
        colorPalette="blue"
        alignSelf="center"
      >
        Login
      </Button>

      <Text textAlign="center" fontSize="14px">
        Don&apos;t have an account?{' '}
        <Link href="/signup" color="blue.500">
          Sign up here
        </Link>
      </Text>
    </Stack>
  );
}

export default function LoginPage() {
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
          px={4}
        >
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
