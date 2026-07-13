import { NextResponse } from 'next/server';

export async function POST(request) {
    // Simulamos la verificación del token de Supabase
    const token = request.headers.get('authorization');

    if (!token) {
        // Si no hay token, devolvemos el error 401 (Unauthorized)
        return NextResponse.json(
            { error: 'Acceso denegado. Falta el token Bearer de Supabase.' },
            { status: 401 }
        );
    }

    return NextResponse.json({ message: 'Usuario creado con éxito' }, { status: 201 });
}