import { AuthUser } from '@/types/auth';
import { User } from '@/types/user';

export function isUser(user: AuthUser): boolean {
  return user.hasOwnProperty('role');
}

export function isNgo(user: AuthUser): boolean {
  return user.hasOwnProperty('name') && user.hasOwnProperty('principal');
}

export function getUserEntityType(user: AuthUser): 'user' | 'ngo' {
  if (isNgo(user)) {
    return 'ngo';
  } else {
    return 'user';
  }
}

export function getUserRole(user: AuthUser): string {
  if (isUser(user)) {
    const userObj = user as User;
    return userObj.role; // ADMIN OR USER
  } else {
    return 'ngo'; // NGOS ARE ALWAYS OF ROLE NGO
  }
}

// CHECK FOR SPECIFIC ROLE
export function hasRole(user: AuthUser, requiredRole: string): boolean {
  const userRole = getUserRole(user);
  return userRole === requiredRole;
}

export function hasEntityType(
  user: AuthUser,
  requiredType: 'user' | 'ngo',
): boolean {
  const entityType = getUserEntityType(user);
  return entityType === requiredType;
}

// CHECK IF USER IS OWNER OR HAS REQUIRED ROLE
export function canAccessResource(
  user: AuthUser,
  resourceOwnerId?: string,
  requiredRole?: string,
): boolean {
  if (resourceOwnerId && resourceOwnerId === user.id) return true;

  if (requiredRole && hasRole(user, requiredRole)) return true;

  return false;
}

export function isAdmin(user: AuthUser): boolean {
  return hasRole(user, 'admin');
}
