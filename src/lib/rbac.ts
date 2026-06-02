import type { Role } from "./rbac-types";

export type { Role };

/**
 * Проверяет, имеет ли пользователь одну из указанных ролей.
 * Используется в API-роутах.
 */
export function checkRole(userRole: string | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as Role);
}

/**
 * Проверяет сессию и роль в API-роуте.
 * Возвращает объект с ошибкой или null, если всё ок.
 */
export async function requireRole(allowedRoles: Role[]): Promise<{ error: import("next/server").NextResponse | null; userId: string | null; role: string | null }> {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("./auth");
  const { NextResponse } = await import("next/server");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }), userId: null, role: null };
  }
  const userRole = session.user.role || 'STUDENT';
  if (!checkRole(userRole, allowedRoles)) {
    return { error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }), userId: session.user.id, role: userRole };
  }
  return { error: null, userId: session.user.id, role: userRole };
}

/**
 * Получает роль пользователя из сессии.
 */
export async function getUserRole(): Promise<string | null> {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("./auth");
  const session = await getServerSession(authOptions);
  return session?.user?.role || null;
}
