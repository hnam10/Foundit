'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import TextInput from '../../components/TextInput';
import {
  Box,
  Button,
  Stack,
  Heading,
  HStack,
  Link,
  Text,
} from '@chakra-ui/react';
import { useSignUpForm } from '../../hooks/useSignupForm';

export default function SignUpPage() {
  const {
    role,
    setRole,

    email,
    setEmail,
    emailError,
    handleEmailBlur,

    firstName,
    setFirstName,

    lastName,
    setLastName,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    firstNameError,
    lastNameError,
    passwordError,
    confirmPasswordError,

    handleSignUp,
  } = useSignUpForm();

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
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <Navbar variant="guest" />

        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Stack
            bg="white"
            rounded="md"
            shadow="md"
            w="532px"
            p="50px"
            gap="28px"
          >
            <Heading fontSize="40px" textAlign="center" color="#0F172A">
              Sign Up
            </Heading>

            <Stack gap="20px">
              <Stack gap="6px" w="150px">
                <Text fontSize="14px" color="#1a1a1a">
                  Account Type
                </Text>
                <select
                  style={{
                    height: '42px',
                    border: '1px solid #D9D9D9',
                    borderRadius: '6px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    backgroundColor: 'white',
                    outline: 'none',
                  }}
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as 'student' | 'security')
                  }
                >
                  <option value="student">Student</option>
                  <option value="security">Security</option>
                </select>
              </Stack>

              <HStack gap="24px" align="flex-start">
                <TextInput
                  id="firstName"
                  label="First Name"
                  value={firstName}
                  width="full"
                  onChange={(e) => setFirstName(e.target.value)}
                  error={firstNameError}
                />

                <TextInput
                  id="lastName"
                  label="Last Name"
                  value={lastName}
                  width="full"
                  onChange={(e) => setLastName(e.target.value)}
                  error={lastNameError}
                />
              </HStack>
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
              {/* <TextInput
                id="schoolId"
                label="Student/Employee ID"
                value={schoolId}
                width="full"
                onChange={(e) => setSchoolId(e.target.value)}
                onBlur={() => validateSchoolIdField(schoolId)}
                error={schoolIdError}
              /> */}

              <TextInput
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={password}
                width="full"
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
              />

              <TextInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                width="full"
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError}
              />
            </Stack>

            <Button
              w="172px"
              h="48px"
              rounded="12px"
              fontSize="16px"
              colorPalette="blue"
              onClick={handleSignUp}
              alignSelf="center"
            >
              Sign Up
            </Button>

            <Text textAlign="center" fontSize="14px">
              Already have an account?{' '}
              <Link href="/login" color="blue.500">
                Login here
              </Link>
            </Text>
          </Stack>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
