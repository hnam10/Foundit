import { Box, Text, VStack, chakra } from '@chakra-ui/react';
import { LuUpload } from 'react-icons/lu';
import { useImageUploadGallery } from '../hooks/useImageUploadGallery';

const Label = chakra('label');

interface ImageUploadGalleryProps {
  onChange?: (files: File[]) => void;
  error?: string;
}

export default function ImageUploadGallery({
  onChange,
  error,
}: ImageUploadGalleryProps) {
  const {
    images,
    inputRef,
    canAddMore,
    maxImages,
    handleFilesSelected,
    handleRemove,
  } = useImageUploadGallery({ onChange });

  return (
    <VStack align="stretch" gap={2}>
      <Label
        htmlFor="image-upload-input"
        w="100%"
        h="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        border="1px dashed"
        borderColor={error ? 'red.500' : 'blue.300'}
        bg={error ? 'red.50' : 'blue.50'}
        color="blue.500"
        borderRadius="sm"
        cursor={canAddMore ? 'pointer' : 'not-allowed'}
        opacity={canAddMore ? 1 : 0.6}
        fontWeight={600}
        transition="background 0.15s ease"
        _hover={canAddMore ? { bg: 'blue.100' } : undefined}
      >
        <LuUpload size={16} />
        <Text fontSize="sm">Upload Picture</Text>
        <input
          id="image-upload-input"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          disabled={!canAddMore}
          onChange={handleFilesSelected}
        />
      </Label>

      {images.length > 0 && (
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
          {images.map((img) => (
            <Box key={img.previewUrl} position="relative">
              <Box
                position="relative"
                w="80%"
                h="80%"
                borderRadius="sm"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
              >
                <chakra.img
                  src={img.previewUrl}
                  alt="uploaded preview"
                  w="80%"
                  h="80%"
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
                  onClick={() => handleRemove(img.previewUrl)}
                  aria-label="Remove image"
                >
                  ×
                </chakra.button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Text fontSize="xs" color="red.500">
          {error}
        </Text>
      )}

      <Text fontSize="xs" color="gray.500">
        Maximum {maxImages} images. Supported formats: JPEG, PNG, WebP. Max
        size: 5MB each.
      </Text>
    </VStack>
  );
}
