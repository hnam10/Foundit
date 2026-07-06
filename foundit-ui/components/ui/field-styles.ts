/**
 * Shared form-field styling used by TextInput, FormTextInput, SelectInput and
 * TextAreaInput so the label / helper / control visuals cannot drift apart.
 * Colors reference the semantic tokens defined in components/ui/provider.tsx.
 */

export const fieldLabelStyles = {
  fontSize: '1rem',
  fontWeight: 'semibold',
  lineHeight: '1.6',
  color: 'fg',
} as const;

/** Left-column label for the two-column (label left, control right) layout. */
export const inlineFieldLabelStyles = {
  ...fieldLabelStyles,
  w: '180px',
  flexShrink: 0,
  mt: 2.5,
  mb: 0,
  whiteSpace: 'nowrap',
} as const;

export const fieldHelperStyles = {
  fontSize: '0.875rem',
  lineHeight: '1.6',
  color: 'fg.muted',
} as const;

/** Border, focus ring and typography shared by input/select/textarea controls. */
export const fieldControlStyles = {
  fontSize: '1rem',
  fontWeight: 'normal',
  color: 'fg',
  bg: 'white',
  borderWidth: '1px',
  borderRadius: 'md',
  borderColor: 'border.input',
  _invalid: { borderColor: 'border.error' },
  _focusVisible: {
    outline: 'none',
    boxShadow: '0 0 0 2px {colors.focusRing}',
    borderColor: 'inherit',
  },
} as const;
