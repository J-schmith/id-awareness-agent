import { z } from 'zod'

export const themeSchema = z.object({
  label: z.string().min(1, 'Theme label is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
})

export const awarenessDaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.coerce.date(),
  themeId: z.string().min(1, 'Theme is required'),
  sourceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const subscriberSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  name: z.string().optional(),
  segments: z.array(z.string()).default([]),
})

export const draftUpdateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imageAlt: z.string().optional().default(''),
  imageCredit: z.string().optional().default(''),
})

export const csvImportSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  name: z.string().optional().default(''),
  segments: z
    .string()
    .optional()
    .default('')
    .transform((val) =>
      val
        ? val
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
})

// Type exports inferred from schemas
export type ThemeInput = z.infer<typeof themeSchema>
export type AwarenessDayInput = z.infer<typeof awarenessDaySchema>
export type SubscriberInput = z.infer<typeof subscriberSchema>
export type DraftUpdateInput = z.infer<typeof draftUpdateSchema>
export type CsvImportRow = z.infer<typeof csvImportSchema>
