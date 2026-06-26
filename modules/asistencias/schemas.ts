import { z } from 'zod'

export const checkInSchema = z.object({
  numero_documento: z
    .string()
    .min(3, { message: 'El documento debe tener al menos 3 caracteres.' })
    .max(20, { message: 'El documento no puede exceder los 20 caracteres.' })
    .regex(/^[a-zA-Z0-9]+$/, { message: 'El documento solo debe contener letras y números sin espacios ni caracteres especiales.' }),
})

export type CheckInInput = z.infer<typeof checkInSchema>
