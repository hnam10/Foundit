'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Box, Heading, Stack, Text } from '@chakra-ui/react';

export default function ReportSubmitted() {
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

        <Box flex={1} px={8} pt={10} pb={10}>
          <Heading
            fontSize="36px"
            fontWeight="bold"
            color="white"
            mb={8}
            textAlign="center"
          >
            Report Found Item
          </Heading>

          <Box
            bg="white"
            rounded="md"
            shadow="md"
            h="420px"
            w="85%"
            maxW="1100px"
            mx="auto"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Stack alignItems="center" textAlign="center" maxW="700px">
              <Heading fontSize="40px" color="black" fontWeight="bold" mb={6}>
                Thank You!
              </Heading>

              <Stack gap={1} align="center" px={10}>
                <Text color="#666666">
                  Your found item report has been submitted.
                </Text>

                <Text color="#666666">
                  Thank you for taking the time to help return lost items to
                  their owners.
                </Text>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
