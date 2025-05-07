// Configuración para el webhook de Telegram

export const AUTHORIZED_USERS = [
  {
    id: 474426118,
    name: 'Paco',
    username: '@Pac0_1111',
    lang: 'es'
  }
];

// Función para verificar si un usuario está autorizado
export function isAuthorizedUser(userId: number): boolean {
  return AUTHORIZED_USERS.some(user => user.id === userId);
}
