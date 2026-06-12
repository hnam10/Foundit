'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import TextInput from '@/components/TextInput';

const EXPIRY_SECONDS = 30 * 60;

interface StudentInfo {
  name: string;
  studentId: string;
  email: string;
}

interface GeneratedLink {
  token: string;
  url: string;
  expiresAt: number;
}

function generateToken(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 7; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={1}>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
        {label}
      </Text>
      <Input
        value={value}
        readOnly
        h={12}
        px={4}
        fontSize="md"
        bg="white"
        borderColor="gray.300"
        color="gray.800"
        cursor="default"
        _focusVisible={{ outline: 'none', boxShadow: 'none' }}
      />
    </Stack>
  );
}

export default function GenerateQrPage() {
  const [student, setStudent] = useState<StudentInfo>({
    name: '',
    studentId: '',
    email: '',
  });
  const [generated, setGenerated] = useState<GeneratedLink | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const generateLink = useCallback((info: StudentInfo) => {
    const token = generateToken();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/report/${token}?student=${encodeURIComponent(info.name)}`;

    setGenerated({
      token,
      url,
      expiresAt: Date.now() + EXPIRY_SECONDS * 1000,
    });
    setRemainingSeconds(EXPIRY_SECONDS);
  }, []);

  useEffect(() => {
    if (!generated) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((generated.expiresAt - Date.now()) / 1000)
      );
      setRemainingSeconds(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [generated]);

  const handleSend = () => {
    if (
      !student.name.trim() ||
      !student.studentId.trim() ||
      !student.email.trim()
    ) {
      return;
    }
    generateLink(student);
  };

  const handleSendAgain = () => {
    generateLink(student);
  };

  const isFormValid =
    student.name.trim() && student.studentId.trim() && student.email.trim();

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          color="gray.900"
        >
          Generate QR code
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Please verify student who report found item
        </Text>
      </Stack>

      {!generated ? (
        <Box
          maxW="480px"
          mx="auto"
          w="full"
          bg="gray.100"
          borderRadius="lg"
          p={{ base: 6, md: 8 }}
        >
          <Stack gap={5}>
            <TextInput
              label="Student Name"
              placeholder="John Doe"
              value={student.name}
              onChange={(e) =>
                setStudent((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <TextInput
              label="student ID"
              placeholder="123456789"
              value={student.studentId}
              onChange={(e) =>
                setStudent((prev) => ({ ...prev, studentId: e.target.value }))
              }
            />
            <TextInput
              label="Student email"
              type="email"
              placeholder="JohnDoe@email.com"
              value={student.email}
              onChange={(e) =>
                setStudent((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Button
              w="full"
              h={12}
              bg="blue.500"
              color="white"
              fontSize="md"
              fontWeight="semibold"
              borderRadius="md"
              _hover={{ bg: 'blue.600' }}
              _disabled={{ bg: 'blue.300', cursor: 'not-allowed' }}
              disabled={!isFormValid}
              onClick={handleSend}
            >
              Send QR Code
            </Button>
          </Stack>
        </Box>
      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align="stretch">
          <Box flex={1} bg="gray.100" borderRadius="lg" p={{ base: 6, md: 8 }}>
            <Stack gap={5}>
              <ReadOnlyField label="Student Name" value={student.name} />
              <ReadOnlyField label="student ID" value={student.studentId} />
              <ReadOnlyField label="Student email" value={student.email} />
              <Button
                w="full"
                h={12}
                bg="gray.400"
                color="white"
                fontSize="md"
                fontWeight="semibold"
                borderRadius="md"
                _hover={{ bg: 'gray.500' }}
                onClick={handleSendAgain}
              >
                Send Again
              </Button>
            </Stack>
          </Box>

          <Box
            flex={1}
            bg="blue.50"
            borderRadius="lg"
            p={{ base: 6, md: 8 }}
            position="relative"
          >
            <Text
              position="absolute"
              top={4}
              right={4}
              fontSize="sm"
              fontWeight="semibold"
              color="blue.600"
            >
              {remainingSeconds > 0
                ? `Expire in ${formatCountdown(remainingSeconds)}`
                : 'Expired'}
            </Text>

            <Stack gap={6} pt={{ base: 8, md: 4 }}>
              <Stack gap={3} align="center">
                <Heading
                  as="h2"
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.900"
                >
                  QR Code
                </Heading>
                <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                  <QRCode
                    value={generated.url}
                    size={180}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                </Box>
              </Stack>

              <Stack gap={2}>
                <Heading
                  as="h2"
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.900"
                >
                  Link
                </Heading>
                <Text
                  fontSize="sm"
                  color="blue.700"
                  wordBreak="break-all"
                  bg="white"
                  px={4}
                  py={3}
                  borderRadius="md"
                >
                  {generated.url}
                </Text>
              </Stack>
            </Stack>
          </Box>
        </Flex>
      )}
    </Stack>
  );
}
