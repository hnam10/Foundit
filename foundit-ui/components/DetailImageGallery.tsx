'use client';

import { useState } from 'react';
import { Box, Flex, Image, Stack, Text, chakra } from '@chakra-ui/react';
import { IoImageOutline } from 'react-icons/io5';
import type { SecurityItemImage } from '@/types/items';

interface DetailImageGalleryProps {
  images: SecurityItemImage[];
  alt: string;
}

const MAIN_IMAGE_HEIGHT = { base: '320px', sm: '360px' } as const;
const MAIN_IMAGE_WIDTH = { base: 'full', sm: '280px' } as const;
const THUMB_WIDTH = '100px';
const ThumbnailButton = chakra('button');

export function DetailImageGallery({ images, alt }: DetailImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeIndex =
    images.length === 0 ? 0 : Math.min(selectedIndex, images.length - 1);

  const selectedImage = images[activeIndex];
  const hasMultiple = images.length > 1;

  return (
    <Stack
      gap={2}
      flexShrink={0}
      w={{ base: 'full', sm: hasMultiple ? '388px' : '280px' }}
      role="group"
      aria-label="Photos"
    >
      <Flex
        gap={2}
        align="stretch"
        direction="row"
        w="full"
        h={MAIN_IMAGE_HEIGHT}
      >
        <Box
          flex={1}
          minW={0}
          w={hasMultiple ? undefined : MAIN_IMAGE_WIDTH}
          h="full"
          borderRadius="md"
          overflow="hidden"
          bg="gray.100"
          borderWidth="1px"
          borderColor="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {selectedImage ? (
            <Image
              src={selectedImage.imageUrl}
              alt={`${alt}${hasMultiple ? `, photo ${activeIndex + 1} of ${images.length}` : ''}`}
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

        {hasMultiple ? (
          <Stack
            gap={2}
            w={THUMB_WIDTH}
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
  );
}
