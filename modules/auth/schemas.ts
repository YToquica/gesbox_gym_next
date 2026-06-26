import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Debe ingresar un correo electrónico válido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    .min(1, { message: 'La contraseña es requerida' }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, { message: 'El nombre completo debe tener al menos 3 caracteres.' }),
  tipo_documento: z.enum(['CC', 'CE', 'TI', 'PASAPORTE'], {
    message: 'Seleccione un tipo de documento válido.',
  }),
  numero_documento: z
    .string()
    .min(3, { message: 'El documento debe tener al menos 3 caracteres.' })
    .max(20, { message: 'El documento no puede exceder los 20 caracteres.' })
    .regex(/^[a-zA-Z0-9]+$/, { message: 'El documento solo debe contener letras y números sin espacios ni caracteres especiales.' }),
  telefono: z
    .string()
    .min(7, { message: 'El teléfono debe tener al menos 7 dígitos.' })
    .max(15, { message: 'El teléfono no puede exceder los 15 dígitos.' })
    .regex(/^[0-9+ ]+$/, { message: 'El teléfono solo debe contener números, espacios o el símbolo +.' }),
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Debe ingresar un correo electrónico válido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
})

export type RegisterInput = z.infer<typeof registerSchema>

