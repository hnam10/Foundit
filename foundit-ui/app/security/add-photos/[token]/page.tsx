'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  VStack,
  chakra,
} from '@chakra-ui/react';
import { LuCamera, LuCircleAlert } from 'react-icons/lu';
import { validatePhotoSession } from '@/lib/api/photoSessions';
import { uploadPhotoToSession } from '@/utils/uploadPhotoSessionImage';

const Label = chakra('label');

const MAX_IMAGES = 3;

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; reason: 'available'; maxImages: number }
  | { status: 'ready'; reason: 'not_found' | 'expired' }
  | { status: 'error' };

interface UploadedPhoto {
  imageId: string;
  previewUrl: string;
}

export default function AddPhotosPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';

  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function run() {
      if (!token) {
        if (active) setPageState({ status: 'error' });
        return;
      }

      try {
        const result = await validatePhotoSession(token);
        if (!active) return;

        if (result.reason === 'available') {
          setPageState({
            status: 'ready',
            reason: 'available',
            maxImages: result.maxImages,
          });
        } else {
          setPageState({ status: 'ready', reason: result.reason });
        }
      } catch {
        if (active) setPageState({ status: 'error' });
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [photos]);

  const canAddMore =
    pageState.status === 'ready' &&
    pageState.reason === 'available' &&
    photos.length < MAX_IMAGES;

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !canAddMore || uploading) return;

    setUploadError(null);
    setUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      const registered = await uploadPhotoToSession(token, file);
      setPhotos((prev) => [
        ...prev,
        { imageId: registered.imageId, previewUrl },
      ]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  }

  if (pageState.status === 'loading') {
    return (
      <Flex minH="100dvh" align="center" justify="center" bg="gray.50" px={4}>
        <Text color="gray.600">Loading…</Text>
      </Flex>
    );
  }

  if (pageState.status === 'error') {
    return (
      <MessageCard
        title="Something went wrong"
        message="Could not load this upload link. Please scan the QR code again."
      />
    );
  }

  if (pageState.reason === 'not_found') {
    return (
      <MessageCard
        title="Invalid link"
        message="This photo upload link is not valid."
      />
    );
  }

  if (pageState.reason === 'expired') {
    return (
      <MessageCard
        title="Link expired"
        message="This upload link has expired. Scan a new QR code from the report form."
      />
    );
  }

  return (
    <Flex minH="100dvh" direction="column" bg="gray.50" px={4} py={8}>
      <Stack gap={6} maxW="400px" mx="auto" w="100%">
        <Stack gap={1} textAlign="center">
          <Heading size="lg" color="gray.900">
            Add photos
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Take photos of the found item. They will appear on the report form
            on your computer.
          </Text>
        </Stack>

        <Label
          htmlFor="phone-camera-input"
          w="100%"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          border="1px dashed"
          borderColor="blue.300"
          bg="blue.50"
          color="blue.600"
          borderRadius="md"
          cursor={canAddMore && !uploading ? 'pointer' : 'not-allowed'}
          opacity={canAddMore && !uploading ? 1 : 0.6}
          fontWeight={600}
        >
          <LuCamera size={18} />
          <Text fontSize="sm">{uploading ? 'Uploading…' : 'Take photo'}</Text>
          <input
            id="phone-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            disabled={!canAddMore || uploading}
            onChange={handleFileSelected}
          />
        </Label>

        {uploadError && <HStackAlert message={uploadError} />}

        {photos.length > 0 && (
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
            {photos.map((photo) => (
              <Box
                key={photo.imageId}
                borderRadius="md"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                aspectRatio={1}
              >
                <chakra.img
                  src={photo.previewUrl}
                  alt="Uploaded"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
            ))}
          </Box>
        )}

        <Text fontSize="xs" color="gray.500" textAlign="center">
          {photos.length} / {MAX_IMAGES} photos. You can close this page when
          done.
        </Text>
      </Stack>
    </Flex>
  );
}

function MessageCard({ title, message }: { title: string; message: string }) {
  return (
    <Flex minH="100dvh" align="center" justify="center" bg="gray.50" px={4}>
      <VStack
        gap={3}
        maxW="400px"
        textAlign="center"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={6}
      >
        <Heading size="md" color="gray.900">
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.600">
          {message}
        </Text>
      </VStack>
    </Flex>
  );
}

function HStackAlert({ message }: { message: string }) {
  return (
    <Flex
      gap={2}
      align="center"
      bg="red.50"
      border="1px solid"
      borderColor="red.200"
      borderRadius="md"
      px={3}
      py={2}
      color="red.700"
    >
      <LuCircleAlert size={16} aria-hidden />
      <Text fontSize="sm">{message}</Text>
    </Flex>
  );
}
