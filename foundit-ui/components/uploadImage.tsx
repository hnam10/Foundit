// ImageUploadGallery.tsx
import {
  Box,
  chakra,
  CloseButton,
  Grid,
  GridItem,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuUpload } from 'react-icons/lu';
import { useImageUploadGallery } from '../hooks/useImageUploadGallery';

const Label = chakra('label');

interface ImageUploadGalleryProps {
  accessToken: string;
  onChange?: (images: { imageUrl: string; fileType: string }[]) => void;
  error?: string;
}

export default function ImageUploadGallery({
  accessToken,
  onChange,
  error,
}: ImageUploadGalleryProps) {
  const { images, canAddMore, maxImages, handleFilesSelected, handleRemove } =
    useImageUploadGallery({ accessToken, onChange });

  return (
    <VStack align="stretch" gap={2}>
      {/* Upload bar - thin, sits above the previews */}
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
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          disabled={!canAddMore}
          onChange={handleFilesSelected}
        />
      </Label>

      {/* Thumbnails - max 3, displayed in a single row */}
      {images.length > 0 && (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {images.map((img) => (
            <GridItem key={img.previewUrl} position="relative">
              <Box
                position="relative"
                w="80%%"
                h="80%"
                borderRadius="sm"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
              >
                <Image
                  src={img.previewUrl}
                  alt="uploaded preview"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  opacity={img.status === 'uploading' ? 0.5 : 1}
                />

                {img.status === 'uploading' && (
                  <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="blackAlpha.300"
                  >
                    <Text fontSize="xs" color="white" fontWeight={500}>
                      uploading...
                    </Text>
                  </Box>
                )}

                {img.status === 'error' && (
                  <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="red.50"
                  >
                    <Text fontSize="xs" color="red.500" fontWeight={500}>
                      Failed to upload
                    </Text>
                  </Box>
                )}

                <CloseButton
                  size="sm"
                  position="absolute"
                  top={1}
                  right={1}
                  borderRadius="full"
                  bg="blackAlpha.600"
                  color="white"
                  _hover={{ bg: 'blackAlpha.800' }}
                  onClick={() => handleRemove(img.previewUrl)}
                />
              </Box>
            </GridItem>
          ))}
        </Grid>
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
