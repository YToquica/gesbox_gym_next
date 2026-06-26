import { z } from 'zod'

export const planSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
    .max(100, { message: 'El nombre no puede exceder los 100 caracteres.' }),
  precio: z
    .coerce // Convierte el input a número
    .number()
    .min(0, { message: 'El precio no puede ser negativo.' }),
  duracion_dias: z
    .coerce
    .number()
    .int({ message: 'La duración debe ser un número entero.' })
    .min(1, { message: 'La duración debe ser de al menos 1 día.' }),
})

export type PlanInput = z.infer<typeof planSchema>
