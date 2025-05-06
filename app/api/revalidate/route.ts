import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Esta API permite actualizar el caché de páginas después de modificar contenido
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || '/';
  
  // Revalidar la ruta solicitada
  revalidatePath(path);
  
  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    path
  });
}
