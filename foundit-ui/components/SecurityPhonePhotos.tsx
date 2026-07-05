'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  chakra,
} from '@chakra-ui/react';
import { LuSmartphone, LuX } from 'react-icons/lu';
import QRCode from 'react-qr-code';
import {
  createPhotoSession,
  deletePhotoSessionImage,
  pollPhotoSessionImages,
  type SubmitImageRef,
} from '@/lib/api/photoSessions';

const POLL_INTERVAL_MS = 3000;
const MAX_PHONE_IMAGES = 3;

const TriggerButton = chakra('button');

interface SecurityPhonePhotosProps {
  onSessionImagesChange: (images: SubmitImageRef[]) => void;
}

export default function SecurityPhonePhotos({
  onSessionImagesChange,
}: SecurityPhonePhotosProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [images, setImages] = useState<
    Array<SubmitImageRef & { imageId: string; previewUrl?: string }>
  >([]);
  const [loadingSession, setLoadingSession] = useState(false);

  const qrUrl = useMemo(() => {
    if (!sessionToken || typeof window === 'undefined') return '';
    return `${window.location.origin}/security/add-photos/${sessionToken}`;
  }, [sessionToken]);

  const syncImages = useCallback(
    (
      next: Array<SubmitImageRef & { imageId: string; previewUrl?: string }>
    ) => {
      setImages(next);
      onSessionImagesChange(
        next.map(({ imageUrl, fileType, fileSizeKb }) => ({
          imageUrl,
          fileType,
          fileSizeKb,
        }))
      );
    },
    [onSessionImagesChange]
  );

  useEffect(() => {
    if (!sessionToken) return;

    let active = true;

    async function poll() {
      try {
        const result = await pollPhotoSessionImages(sessionToken!);
        if (!active) return;
        syncImages(result.images);
      } catch {
        // Polling errors are non-fatal; next tick retries
      }
    }

    poll();
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [sessionToken, syncImages]);

  async function handleOpenQr() {
    if (showQr) return;

    if (sessionToken) {
      setShowQr(true);
      return;
    }

    setLoadingSession(true);
    setSessionError(null);
    try {
      const session = await createPhotoSession();
      setSessionToken(session.token);
      setShowQr(true);
    } catch (err) {
      setSessionError(
        err instanceof Error
          ? err.message
          : 'Could not start phone photo session.'
      );
    } finally {
      setLoadingSession(false);
    }
  }

  async function handleRemove(imageId: string) {
    if (!sessionToken) return;
    try {
      await deletePhotoSessionImage(sessionToken, imageId);
      setImages((prev) => {
        const next = prev.filter((img) => img.imageId !== imageId);
        onSessionImagesChange(
          next.map(({ imageUrl, fileType, fileSizeKb }) => ({
            imageUrl,
            fileType,
            fileSizeKb,
          }))
        );
        return next;
      });
    } catch {
      // Keep UI unchanged on failure; next poll may reconcile
    }
  }

  const slotsRemaining = MAX_PHONE_IMAGES - images.length;
  const sessionActive = Boolean(sessionToken);
  const waitingForPhotos = sessionActive && showQr && images.length === 0;

  return (
    <VStack align="stretch" gap={3}>
      {!showQr && (
        <TriggerButton
          type="button"
          w="100%"
          h="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          border="1px dashed"
          borderColor="gray.300"
          bg="gray.50"
          color="gray.700"
          borderRadius="sm"
          cursor={loadingSession ? 'wait' : 'pointer'}
          opacity={loadingSession ? 0.7 : 1}
          fontWeight={600}
          fontSize="sm"
          transition="background 0.15s ease, border-color 0.15s ease"
          _hover={
            loadingSession
              ? undefined
              : { bg: 'gray.100', borderColor: 'gray.400' }
          }
          onClick={handleOpenQr}
          disabled={loadingSession}
        >
          {loadingSession ? (
            <>
              <Spinner size="sm" color="gray.500" />
              Preparing QR code…
            </>
          ) : (
            <>
              <LuSmartphone size={16} />
              {sessionActive && images.length > 0
                ? `Phone photos (${images.length}/${MAX_PHONE_IMAGES})`
                : 'Add photos from phone'}
            </>
          )}
        </TriggerButton>
      )}

      {sessionActive && !showQr && (
        <Text fontSize="xs" color="gray.500" textAlign="center">
          <chakra.button
            type="button"
            color="blue.600"
            fontWeight="medium"
            textDecoration="underline"
            onClick={() => setShowQr(true)}
          >
            Show QR code again
          </chakra.button>
          {' · '}
          Up to {MAX_PHONE_IMAGES} photos from your phone
        </Text>
      )}

      {sessionError && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="sm"
          px={3}
          py={2}
        >
          <Text fontSize="sm" color="red.700">
            {sessionError}
          </Text>
        </Box>
      )}

      {showQr && qrUrl && (
        <Box
          border="1px solid"
          borderColor="blue.200"
          bg="blue.50"
          borderRadius="md"
          overflow="hidden"
        >
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor="blue.100"
            bg="white"
          >
            <HStack gap={2}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                w={8}
                h={8}
                borderRadius="full"
                bg="blue.100"
                color="blue.600"
              >
                <LuSmartphone size={16} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                  Scan with your phone
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Take up to {MAX_PHONE_IMAGES} photos on your phone
                </Text>
              </Box>
            </HStack>
            <IconButton
              type="button"
              aria-label="Hide QR code"
              variant="ghost"
              size="sm"
              color="gray.500"
              onClick={() => setShowQr(false)}
            >
              <LuX size={16} />
            </IconButton>
          </Flex>

          <VStack gap={4} px={4} py={5}>
            <Box
              p={3}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              boxShadow="sm"
            >
              <QRCode value={qrUrl} size={168} />
            </Box>

            <VStack gap={1} align="stretch" w="100%">
              <Step number={1} text="Scan the code with your phone camera" />
              <Step number={2} text="Take photos of the found item" />
              <Step
                number={3}
                text="Photos appear below automatically — keep filling out the form"
              />
            </VStack>

            {waitingForPhotos && (
              <HStack
                gap={2}
                px={3}
                py={2}
                w="100%"
                justify="center"
                borderRadius="sm"
                bg="white"
                border="1px dashed"
                borderColor="blue.200"
              >
                <Spinner size="xs" color="blue.500" />
                <Text fontSize="xs" color="blue.700" fontWeight="medium">
                  Waiting for photos from your phone…
                </Text>
              </HStack>
            )}

            {images.length > 0 && (
              <Text fontSize="xs" color="green.700" fontWeight="medium">
                {images.length} of {MAX_PHONE_IMAGES} phone photos received
                {slotsRemaining > 0
                  ? ` — ${slotsRemaining} more allowed`
                  : ' — limit reached'}
              </Text>
            )}
          </VStack>
        </Box>
      )}

      {images.length > 0 && (
        <Box>
          <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={2}>
            From phone
          </Text>
          <SimpleGrid columns={3} gap={2}>
            {images.map((img) => (
              <Box key={img.imageId} position="relative">
                <Box
                  borderRadius="sm"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="gray.200"
                  aspectRatio={1}
                  bg="gray.100"
                >
                  <chakra.img
                    src={img.previewUrl ?? ''}
                    alt="Phone upload"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                  <chakra.button
                    type="button"
                    position="absolute"
                    top={1}
                    right={1}
                    w={6}
                    h={6}
                    borderRadius="full"
                    bg="blackAlpha.600"
                    color="white"
                    fontSize="sm"
                    lineHeight={1}
                    _hover={{ bg: 'blackAlpha.800' }}
                    onClick={() => handleRemove(img.imageId)}
                    aria-label="Remove phone photo"
                  >
                    ×
                  </chakra.button>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <HStack gap={2} align="flex-start">
      <Flex
        flexShrink={0}
        w={5}
        h={5}
        align="center"
        justify="center"
        borderRadius="full"
        bg="blue.100"
        color="blue.700"
        fontSize="xs"
        fontWeight="bold"
      >
        {number}
      </Flex>
      <Text fontSize="xs" color="gray.600" pt="2px">
        {text}
      </Text>
    </HStack>
  );
}
