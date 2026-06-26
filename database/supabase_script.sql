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
-- Esta función se ejecuta sola cuando alguien se registra en Supabase Auth.
-- Captura el nombre y metadatos enviados desde el frontend.

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

-- ========================================================
-- 4. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ========================================================
-- Activamos la seguridad por filas en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Funciones auxiliares para RLS no recursivo
CREATE OR REPLACE FUNCTION public.es_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND rol = 'admin'::public.rol_enum
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.es_empleado(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND rol IN ('admin'::public.rol_enum, 'recepcionista'::public.rol_enum)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Funciones de validación para registro
CREATE OR REPLACE FUNCTION public.check_document_exists(doc_num TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles WHERE numero_documento = doc_num
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE email = email_to_check
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public;

-- Políticas para 'Profiles'
CREATE POLICY "Permitir lectura pública de perfiles a empleados" 
    ON public.profiles FOR SELECT 
    USING (auth.jwt() ->> 'role' = 'authenticated'); -- Permitido para agilizar la búsqueda en recepción

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins pueden hacer todo en perfiles" 
    ON public.profiles FOR ALL 
    USING (public.es_admin(auth.uid()));

CREATE POLICY "Admins y recepcionistas pueden actualizar perfiles de otros"
    ON public.profiles FOR UPDATE
    USING (public.es_empleado(auth.uid()));

-- Políticas para 'Planes' (Cualquiera autenticado los ve, solo admin los gestiona)
CREATE POLICY "Cualquiera ve los planes" ON public.planes FOR SELECT USING (true);
CREATE POLICY "Solo admin gestiona planes" ON public.planes FOR ALL USING 
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'));