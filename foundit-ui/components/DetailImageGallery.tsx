'use client';

import { useState } from 'react';
import {
  Box,
  Dialog,
  Flex,
  Image,
  Portal,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoImageOutline,
} from 'react-icons/io5';
import type { SecurityItemImage } from '@/types/items';

interface DetailImageGalleryProps {
  images: SecurityItemImage[];
  alt: string;
  compact?: boolean;
}

const MAIN_IMAGE_HEIGHT = { base: '320px', sm: '360px' } as const;
const MAIN_IMAGE_WIDTH = { base: 'full', sm: '280px' } as const;
const THUMB_WIDTH = '100px';
const COMPACT_MAIN_HEIGHT = '200px';
const COMPACT_THUMB_WIDTH = '56px';
const ThumbnailButton = chakra('button');

function ImageLightbox({
  images,
  alt,
  index,
  onIndexChange,
  open,
  onClose,
}: {
  images: SecurityItemImage[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onClose: () => void;
}) {
  const activeIndex = Math.min(index, images.length - 1);
  const image = images[activeIndex];
  const hasMultiple = images.length > 1;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.800" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="transparent"
            boxShadow="none"
            maxW="90vw"
            maxH="90vh"
            p={0}
          >
            <Stack gap={3} align="center">
              <Flex justify="flex-end" w="full">
                <chakra.button
                  type="button"
                  aria-label="Close image preview"
                  color="white"
                  fontSize="2xl"
                  onClick={onClose}
                >
                  <IoClose />
                </chakra.button>
              </Flex>

              <Box
                position="relative"
                w="full"
                maxW="800px"
                maxH="70vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {hasMultiple ? (
                  <chakra.button
                    type="button"
                    aria-label="Previous photo"
                    position="absolute"
                    left={2}
                    zIndex={1}
                    color="white"
                    fontSize="2xl"
                    bg="blackAlpha.500"
                    borderRadius="full"
                    p={2}
                    onClick={() =>
                      onIndexChange(
                        activeIndex === 0 ? images.length - 1 : activeIndex - 1
                      )
                    }
                  >
                    <IoChevronBack />
                  </chakra.button>
                ) : null}

                {image ? (
                  <Image
                    src={image.imageUrl}
                    alt={`${alt}, photo ${activeIndex + 1} of ${images.length}`}
                    maxH="70vh"
                    maxW="full"
                    objectFit="contain"
                    borderRadius="md"
                  />
                ) : null}

                {hasMultiple ? (
                  <chakra.button
                    type="button"
                    aria-label="Next photo"
                    position="absolute"
                    right={2}
                    zIndex={1}
                    color="white"
                    fontSize="2xl"
                    bg="blackAlpha.500"
                    borderRadius="full"
                    p={2}
                    onClick={() =>
                      onIndexChange(
                        activeIndex === images.length - 1 ? 0 : activeIndex + 1
                      )
                    }
                  >
                    <IoChevronForward />
                  </chakra.button>
                ) : null}
              </Box>

              {hasMultiple ? (
                <Text fontSize="sm" color="white">
                  {activeIndex + 1} of {images.length}
                </Text>
              ) : null}
            </Stack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function GalleryMainImage({
  selectedImage,
  alt,
  activeIndex,
  hasMultiple,
  imagesLength,
  height,
  width,
  onOpenLightbox,
}: {
  selectedImage?: SecurityItemImage;
  alt: string;
  activeIndex: number;
  hasMultiple: boolean;
  imagesLength: number;
  height: string | Record<string, string>;
  width?: string | Record<string, string>;
  onOpenLightbox: () => void;
}) {
  return (
    <Box
      flex={1}
      minW={0}
      w={width}
      h={height}
      borderRadius="md"
      overflow="hidden"
      bg="gray.100"
      borderWidth="1px"
      borderColor="gray.200"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor={selectedImage ? 'zoom-in' : 'default'}
      onClick={selectedImage ? onOpenLightbox : undefined}
      role={selectedImage ? 'button' : undefined}
      tabIndex={selectedImage ? 0 : undefined}
      onKeyDown={
        selectedImage
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenLightbox();
              }
            }
          : undefined
      }
      aria-label={selectedImage ? 'View larger image' : undefined}
    >
      {selectedImage ? (
        <Image
          src={selectedImage.imageUrl}
          alt={`${alt}${hasMultiple ? `, photo ${activeIndex + 1} of ${imagesLength}` : ''}`}
          w="full"
          h="full"
          objectFit="cover"
        />
      ) : (
        <Box color="gray.400" aria-hidden>
          <IoImageOutline size={48} />
        </Box>
      )}
    </Box>
  );
}

export function DetailImageGallery({
  images,
  alt,
  compact = false,
}: DetailImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeIndex =
    images.length === 0 ? 0 : Math.min(selectedIndex, images.length - 1);

  const selectedImage = images[activeIndex];
  const hasMultiple = images.length > 1;
  const thumbWidth = compact ? COMPACT_THUMB_WIDTH : THUMB_WIDTH;
  const mainHeight = compact ? COMPACT_MAIN_HEIGHT : MAIN_IMAGE_HEIGHT;

  const openLightbox = () => {
    if (selectedImage) setLightboxOpen(true);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Stack
        gap={2}
        flexShrink={0}
        w={
          compact
            ? 'full'
            : { base: 'full', sm: hasMultiple ? '388px' : '280px' }
        }
        role="group"
        aria-label="Photos"
      >
        <Flex gap={2} align="stretch" direction="row" w="full" h={mainHeight}>
          <GalleryMainImage
            selectedImage={selectedImage}
            alt={alt}
            activeIndex={activeIndex}
            hasMultiple={hasMultiple}
            imagesLength={images.length}
            height={compact ? COMPACT_MAIN_HEIGHT : 'full'}
            width={
              compact ? undefined : hasMultiple ? undefined : MAIN_IMAGE_WIDTH
            }
            onOpenLightbox={openLightbox}
          />

          {hasMultiple ? (
            <Stack
              gap={2}
              w={thumbWidth}
              flexShrink={0}
              h="full"
              role="list"
              aria-label="Photo thumbnails"
            >
              {images.map((image, index) => {
                const isSelected = index === activeIndex;

                return (
                  <ThumbnailButton
                    key={image.imageId}
                    type="button"
                    role="listitem"
                    flex={1}
                    minH={0}
                    w="full"
                    borderRadius="md"
                    overflow="hidden"
                    bg="gray.100"
                    borderWidth="2px"
                    borderColor={isSelected ? 'blue.500' : 'gray.200'}
                    opacity={isSelected ? 1 : 0.85}
                    cursor="pointer"
                    transition="border-color 0.15s ease, opacity 0.15s ease"
                    _hover={{
                      opacity: 1,
                      borderColor: isSelected ? 'blue.500' : 'gray.300',
                    }}
                    aria-label={`View photo ${index + 1} of ${images.length}`}
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <Image
                      src={image.imageUrl}
                      alt=""
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  </ThumbnailButton>
                );
              })}
            </Stack>
          ) : null}
        </Flex>

        {hasMultiple ? (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            {activeIndex + 1} of {images.length}
          </Text>
        ) : null}
      </Stack>

      <ImageLightbox
        images={images}
        alt={alt}
        index={activeIndex}
        onIndexChange={setSelectedIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
