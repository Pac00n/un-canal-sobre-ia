import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Establecer headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // Obtener el token secreto para seguridad
    const token = req.body.token || req.query.token;
    const expectedToken = process.env.REVALIDATE_TOKEN || process.env.TELEGRAM_API_TOKEN;

    // Verificar el token de seguridad
    if (!token || token !== expectedToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Obtener el path a revalidar (o usar path por defecto)
    const pathToRevalidate = req.body.path || req.query.path || '/';

    // Revalidar el path
    await res.revalidate(pathToRevalidate);

    // También revalidar la página principal siempre
    if (pathToRevalidate !== '/') {
      await res.revalidate('/');
    }

    return res.status(200).json({
      success: true,
      revalidated: true,
      path: pathToRevalidate,
      message: `Revalidación exitosa para ${pathToRevalidate}`
    });
  } catch (error: any) {
    // En caso de error, mostrar detalles
    return res.status(500).json({
      success: false,
      message: `Error en revalidación: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
