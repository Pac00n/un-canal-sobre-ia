import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // La URL completa del request
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Permitir acceso sin restricciones al webhook de Telegram
  if (pathname.startsWith('/api/telegram-webhook')) {
    console.log('[MIDDLEWARE] Permitiendo acceso a webhook de Telegram');
    return NextResponse.next();
  }

  // Continuar con el flujo normal para las demás rutas
  return NextResponse.next();
}

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: [
    // Aplicar a todas las rutas de API
    '/api/:path*',
  ],
};
