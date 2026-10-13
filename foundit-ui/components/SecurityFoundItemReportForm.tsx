'use client';

import { useEffect } from 'react';
import { Box, Grid, HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import FormTextInput from '@/components/FormTextInput';
import FoundItemFormShell from '@/components/FoundItemFormShell';
import SelectInput from '@/components/SelectInput';
import TextAreaInput from '@/components/TextAreaInput';
import ImageUploadGallery from '@/components/ImageUploadGallery';
import SecurityPhonePhotos from '@/components/SecurityPhonePhotos';
import { Button } from '@/components/ui/Button';
import { LuCircleAlert } from 'react-icons/lu';
import { CATEGORIES } from '@/constants/categories';
import { useSecurityFoundItemForm } from '@/hooks/useSecurityFoundItemForm';
import { useAccessToken } from '@/hooks/useAccessToken';
import type { Campus } from '@/types/items';

export interface SecurityFoundItemReportFormProps {
  campuses: Campus[];
  defaultCampusId?: string;
  campusesLoading?: boolean;
}

export default function SecurityFoundItemReportForm({
  campuses,
  defaultCampusId = '',
  campusesLoading = false,
}: SecurityFoundItemReportFormProps) {
  const form = useSecurityFoundItemForm(defaultCampusId);
  const { campusId, setCampusId } = form;
  const accessToken = useAccessToken();

  const campusOptions = campuses.map((campus) => ({
    value: campus.campusId,
    label: campus.campusName,
  }));

  useEffect(() => {
    if (campusesLoading || campuses.length === 0) return;

    const hasValidSelection = campuses.some(
      (campus) => campus.campusId === campusId
    );
    if (!hasValidSelection) {
      const fallback =
        campuses.find((campus) => campus.campusId === defaultCampusId)
          ?.campusId ?? campuses[0].campusId;
      setCampusId(fallback);
    }
  }, [campuses, campusesLoading, defaultCampusId, campusId, setCampusId]);

  return (
    <FoundItemFormShell>
      <Stack gap={5}>
        <FormTextInput
          id="itemName"
          label="Item Name"
          required
          stacked
          placeholder="e.g., Black Nike Backpack"
          maxLength={100}
          value={form.itemName}
          error={form.errors.itemName}
          onChange={(e) => {
            form.setItemName(e.target.value);
            form.clearError('itemName');
          }}
        />

        <SelectInput
          id="category"
          label="Category"
          required
          stacked
          options={CATEGORIES}
          placeholder="Select a category"
          value={form.category}
          error={form.errors.category}
          onChange={(e) => {
            form.setCategory(e.target.value);
            form.clearError('category');
          }}
        />

        <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4}>
          <Box flex={1}>
            <FormTextInput
              id="color"
              label="Color"
              stacked
              placeholder="e.g., Light pink"
              maxLength={30}
              value={form.color}
              onChange={(e) => form.setColor(e.target.value)}
            />
          </Box>
          <Box flex={1}>
            <FormTextInput
              id="brand"
              label="Brand"
              stacked
              placeholder="e.g., Belkin"
              maxLength={50}
              value={form.brand}
              onChange={(e) => form.setBrand(e.target.value)}
            />
          </Box>
        </Grid>

        <FormTextInput
          id="date"
          label="Date found"
          required
          stacked
          type="date"
          max={form.todayISO()}
          value={form.date}
          error={form.errors.date}
          onChange={(e) => {
            form.setDate(e.target.value);
            form.clearError('date');
          }}
        />

        <FormTextInput
          id="location"
          label="Where was the item found?"
          required
          stacked
          placeholder="e.g., Newnham Campus Library"
          maxLength={100}
          value={form.location}
          error={form.errors.location}
          onChange={(e) => {
            form.setLocation(e.target.value);
            form.clearError('location');
          }}
        />

        {campusesLoading ? (
          <HStack gap={3} py={2} justify="center">
            <Spinner size="sm" color="blue.500" />
            <Text fontSize="sm" color="gray.600">
              Loading campuses…
            </Text>
          </HStack>
        ) : (
          <SelectInput
            id="storageCampus"
            label="Storage campus"
            required
            stacked
            hint="Which campus lost & found office will store this item."
            optionItems={campusOptions}
            placeholder="Select a campus"
            value={campusId}
            error={form.errors.campus}
            onChange={(e) => {
              setCampusId(e.target.value);
              form.clearError('campus');
            }}
          />
        )}

        {accessToken && (
          <Box>
            <Text mb={2} fontSize="1rem" fontWeight="semibold" color="gray.800">
              Photos
            </Text>
            <Stack gap={4}>
              <SecurityPhonePhotos
                onSessionImagesChange={form.setSessionImages}
              />
              <HStack gap={3} align="center">
                <Box flex={1} h="1px" bg="gray.200" />
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  or upload from this device
                </Text>
                <Box flex={1} h="1px" bg="gray.200" />
              </HStack>
              <ImageUploadGallery
                onChange={(images) => form.setImageFiles(images)}
              />
              {(form.analysisStatus === 'uploading' ||
                form.analysisStatus === 'analyzing') && (
                <HStack gap={2} color="blue.700">
                  <Spinner size="xs" />
                  <Text fontSize="xs" fontWeight="medium">
                    {form.analysisStatus === 'uploading'
                      ? 'Preparing photo...'
                      : 'Analyzing photo...'}
                  </Text>
                </HStack>
              )}
              {form.analysisMessage && (
                <Text
                  fontSize="xs"
                  color={
                    form.analysisStatus === 'applied' ? 'green.700' : 'gray.600'
                  }
                >
                  {form.analysisMessage}
                </Text>
              )}
            </Stack>
          </Box>
        )}

        <TextAreaInput
          id="description"
          label="Description"
          required
          stacked
          placeholder="Describe the item — color, brand, size, distinguishing features"
          maxLength={1000}
          value={form.description}
          error={form.errors.description}
          onChange={(e) => {
            form.setDescription(e.target.value);
            form.clearError('description');
          }}
        />
      </Stack>

      {form.submitError && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          rounded="md"
          px={4}
          py={3}
        >
          <HStack gap={2} color="red.700">
            <LuCircleAlert size={16} aria-hidden />
            <Text fontSize="sm" fontWeight="medium">
              {form.submitError}
            </Text>
          </HStack>
        </Box>
      )}

      <HStack justify="center" gap={4} pt={2}>
        <Button
          variant="muted"
          minW="140px"
          onClick={form.handleCancel}
          disabled={form.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          minW="140px"
          disabled={form.isSubmitting || campusesLoading}
          loading={form.isSubmitting}
          loadingText="Submitting..."
          onClick={form.handleSubmit}
        >
          Submit report
        </Button>
      </HStack>
    </FoundItemFormShell>
  );
}
