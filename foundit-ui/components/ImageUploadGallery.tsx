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
import { LuPlus, LuUpload } from 'react-icons/lu';
import { useImageUploadGallery } from '../hooks/useImageUploadGallery';

const Label = chakra('label');

interface ImageUploadGalleryProps {
  onChange?: (files: File[]) => void;
  error?: string;
  /**
   * 'bar' — thin 40px upload strip (default, used by report-found).
   * 'dropzone' — large light-blue box matching the Claim Item design.
   */
  variant?: 'bar' | 'dropzone';
}

export default function ImageUploadGallery({
  onChange,
  error,
  variant = 'bar',
}: ImageUploadGalleryProps) {
  const {
    images,
    inputRef,
    canAddMore,
    hasImages,
    maxImages,
    handleFilesSelected,
    handleRemove,
  } = useImageUploadGallery({ onChange });

  return (
    <VStack align="stretch" gap={2}>
      {/* Single hidden input shared by both upload targets (the empty-state
          box and the "+" tile) via htmlFor. Always rendered so the labels
          keep working; ref lets the hook reset it after each selection. */}
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

      {/* Upload target — only while there are no pictures yet; once one is
          added it is replaced by the preview grid's "+" tile below. */}
      {!hasImages && (
        <Label
          htmlFor="image-upload-input"
          w="100%"
          h={variant === 'dropzone' ? '210px' : '40px'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          border={variant === 'dropzone' ? 'none' : '1px dashed'}
          borderColor={error ? 'red.500' : 'blue.300'}
          bg={error ? 'red.50' : 'blue.50'}
          color="blue.500"
          borderRadius={variant === 'dropzone' ? 'lg' : 'sm'}
          cursor="pointer"
          fontWeight={600}
          transition="background 0.15s ease"
          _hover={{ bg: 'blue.100' }}
        >
          <LuUpload size={16} />
          <Text fontSize="sm">Upload Picture</Text>
        </Label>
      )}

      {hasImages && (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {images.map((img) => (
            <GridItem key={img.previewUrl} position="relative">
              {/* Square tile; the image covers it fully and stays centered. */}
              <Box
                position="relative"
                w="full"
                aspectRatio={1}
                borderRadius="sm"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
              >
                <Image
                  src={img.previewUrl}
                  alt="uploaded preview"
                  w="full"
                  h="full"
                  objectFit="cover"
                />

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

          {canAddMore && (
            <GridItem>
              <Label
                htmlFor="image-upload-input"
                aria-label="Add more pictures"
                w="full"
                aspectRatio={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px dashed"
                borderColor={error ? 'red.500' : 'blue.300'}
                bg={error ? 'red.50' : 'blue.50'}
                color="blue.500"
                borderRadius="sm"
                cursor="pointer"
                transition="background 0.15s ease"
                _hover={{ bg: 'blue.100' }}
              >
                <LuPlus size={32} />
              </Label>
            </GridItem>
          )}
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
