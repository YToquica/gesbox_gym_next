-- ========================================================
-- 1. CREACIÓN DE ENUMS Y ENUMERACIONES
-- ========================================================
CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'CE', 'TI', 'PASAPORTE');
CREATE TYPE rol_enum AS ENUM ('admin', 'recepcionista', 'cliente');
CREATE TYPE estado_membresia_enum AS ENUM ('activo', 'vencido', 'congelado');
CREATE TYPE metodo_pago_enum AS ENUM ('Efectivo', 'Nequi', 'Daviplata', 'Tarjeta', 'Transferencia');

-- ========================================================
-- 2. CREACIÓN DE TABLAS (Esquema public)
-- ========================================================

-- Tabla: Profiles (Extension de auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    tipo_documento tipo_documento_enum,
    numero_documento TEXT UNIQUE,
    telefono TEXT,
    rol rol_enum DEFAULT 'cliente'::rol_enum NOT NULL,
    fecha_nacimiento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: Planes
CREATE TABLE public.planes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    duracion_dias INTEGER NOT NULL CHECK (duracion_dias > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: Membresías
CREATE TABLE public.membresias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id BIGINT REFERENCES public.planes(id) ON DELETE RESTRICT NOT NULL,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL,
    estado estado_membresia_enum DEFAULT 'activo'::estado_membresia_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_fechas CHECK (fecha_fin >= fecha_inicio)
);

-- Tabla: Pagos
CREATE TABLE public.pagos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    membresia_id UUID REFERENCES public.membresias(id) ON DELETE CASCADE NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    metodo_pago metodo_pago_enum NOT NULL,
    comprobante_url TEXT, -- URL del bucket de Supabase Storage
    registrado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: Asistencias
CREATE TABLE public.asistencias (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- 3. AUTOMATIZACIÓN: TRIGGER PARA CREACIÓN DE PERFILES
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nombre_completo, tipo_documento, numero_documento, telefono, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Nuevo Usuario'),
        (NEW.raw_user_meta_data->>'tipo_documento')::public.tipo_documento_enum,
        NEW.raw_user_meta_data->>'numero_documento',
        NEW.raw_user_meta_data->>'telefono',
        COALESCE((NEW.raw_user_meta_data->>'rol')::public.rol_enum, 'cliente'::public.rol_enum)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Disparador del trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Revocar ejecución pública del trigger de perfiles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ========================================================
-- 4. SEGURIDAD: ROW LEVEL SECURITY (RLS) Y ESQUEMA PRIVADO
-- ========================================================
-- Activamos la seguridad por filas en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Esquema privado para funciones de seguridad internas (no expuestas por la API PostgREST)
CREATE SCHEMA IF NOT EXISTS private;

-- Funciones auxiliares para RLS no recursivo
CREATE OR REPLACE FUNCTION private.es_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND rol = 'admin'::public.rol_enum
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION private.es_empleado(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND rol IN ('admin'::public.rol_enum, 'recepcionista'::public.rol_enum)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4.1 Políticas para 'Profiles'
CREATE POLICY "Permitir lectura pública de perfiles a empleados" 
    ON public.profiles FOR SELECT 
    USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins y recepcionistas pueden actualizar perfiles de otros"
    ON public.profiles FOR UPDATE
    USING (private.es_empleado(auth.uid()));

CREATE POLICY "Admins pueden hacer todo en perfiles" 
    ON public.profiles FOR ALL 
    USING (private.es_admin(auth.uid()));

-- 4.2 Políticas para 'Planes'
CREATE POLICY "Cualquiera ve los planes" 
    ON public.planes FOR SELECT 
    USING (true);

CREATE POLICY "Solo admin gestiona planes" 
    ON public.planes FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 4.3 Políticas para 'Membresías'
CREATE POLICY "Permitir lectura de membresias propia o a empleados"
    ON public.membresias FOR SELECT
    USING (
        perfil_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Permitir creacion de membresias a empleados"
    ON public.membresias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Permitir modificacion de membresias a empleados"
    ON public.membresias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Solo admin puede eliminar membresias"
    ON public.membresias FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 4.4 Políticas para 'Pagos'
CREATE POLICY "Permitir lectura de pagos propia o a empleados"
    ON public.pagos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        ) OR
        EXISTS (
            SELECT 1 FROM public.membresias m
            WHERE m.id = membresia_id AND m.perfil_id = auth.uid()
        )
    );

CREATE POLICY "Permitir registro de pagos a empleados"
    ON public.pagos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Solo admin puede modificar o eliminar pagos"
    ON public.pagos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- 4.5 Políticas para 'Asistencias'
CREATE POLICY "Permitir lectura de asistencias propia o a empleados"
    ON public.asistencias FOR SELECT
    USING (
        perfil_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Permitir registro de asistencias a empleados"
    ON public.asistencias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Solo admin puede modificar o eliminar asistencias"
    ON public.asistencias FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ========================================================
-- 5. CONFIGURACIÓN DE ALMACENAMIENTO (Supabase Storage)
-- ========================================================
-- Creación del bucket para los comprobantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket 'comprobantes'
CREATE POLICY "Permitir lectura de comprobantes a empleados"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'comprobantes' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Permitir subida de comprobantes a empleados"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'comprobantes' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol IN ('admin', 'recepcionista')
        )
    );

CREATE POLICY "Permitir eliminacion de comprobantes a admins"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'comprobantes' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );
