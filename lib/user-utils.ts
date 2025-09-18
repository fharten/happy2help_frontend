import { AuthUser } from '@/types/auth';
import { User } from '@/types/user';
import { decodeToken } from '@/lib/jwt-utils';

export function isUser(user: AuthUser): boolean {
  return user.hasOwnProperty('role') && user.role !== 'ngo';
}

export function isNgo(user: AuthUser): boolean {
  // METHOD 1: CHECK IF USER OBJECT HAS NGO-SPECIFIC PROPERTIES
  if (user.hasOwnProperty('name') && user.hasOwnProperty('principal'))
    return true;

  // METHOD 2: CHECK IF THERE'S AN EXPLICIT ENTITYTYPE FIELD IN USER OBJECT
  if ('entityType' in user && user.entityType === 'ngo') return true;

  // METHOD 3: CHECK JWT TOKEN FOR ENTITY INFORMATION
  if (typeof window !== 'undefined') {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        const { accessToken } = JSON.parse(tokens);
        const decoded = decodeToken(accessToken);

        if (
          decoded &&
          (decoded.entityType === 'ngo' || decoded.role === 'ngo')
        ) {
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to decode token for NGO check:', error);
    }
  }

  // METHOD 4: CHECK LOCALSTORAGE USERTYPE (FALLBACK)
  if (typeof window !== 'undefined') {
    const userType = localStorage.getItem('userType');
    if (userType === 'ngo' || userType === 'ngos') return true;
  }

  // METHOD 5: CHECK IF USER HAS ROLE 'NGO' (IF ROLE IS IN USER OBJECT)
  if ('role' in user && user.role === 'ngo') return true;

  return false;
}

export function getUserEntityType(user: AuthUser): 'user' | 'ngo' {
  if (isNgo(user)) return 'ngo';
  return 'user';
}

export function getUserRole(user: AuthUser): string {
  // FIRST TRY TO GET ROLE FROM JWT TOKEN
  if (typeof window !== 'undefined') {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        const { accessToken } = JSON.parse(tokens);
        const decoded = decodeToken(accessToken);

        if (decoded && decoded.role) return decoded.role;
      }
    } catch (error) {
      console.warn('Failed to decode token for role check:', error);
    }
  }

  // FALLBACK TO USER OBJECT
  if (isUser(user)) {
    const userObj = user as User;
    return userObj.role;
  } else if (isNgo(user)) return 'ngo';

  return 'user'; // DEFAULT FALLBACK
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

// Interface für die Parameter der getUserDisplayName Funktion
export interface GetUserDisplayNameParams {
  user?: AuthUser | null;
  userId?: string | null;
  userType?: string | null;
  authToken?: string | null;
}

// Lädt den Anzeigenamen für einen Benutzer basierend auf verfügbaren Daten
export async function getUserDisplayName(
  params: GetUserDisplayNameParams,
): Promise<string> {
  const { user, userId, userType, authToken } = params;

  // 1. AuthContext User
  if (user) {
    // User: wir prüfen ob firstName + lastName existieren (property und truthy value check)
    if (
      'firstName' in user &&
      'lastName' in user &&
      user.firstName &&
      user.lastName
    ) {
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.loginEmail.split('@')[0];
    }
    // NGO: wir prüfen erst ob principal existiert (property und truthy value check)
    else if ('principal' in user && user.principal) return user.principal;
    // NGO: als fallbacken prüfen wir ob name existiert (property und truthy value check)
    else if ('name' in user && user.name) return user.name;
  }

  // 2. API call
  if (userId) {
    try {
      let apiUrl = '';

      // Unterschiedliche APIs für USERs bzw. NGOs
      if (userType === 'ngos' || userType === 'ngo') {
        apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${userId}`;
      } else if (userType === 'users' || userType === 'user') {
        apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}`;
      }

      if (apiUrl) {
        // Falls ein authToken vorhanden ist, wird der authorization bearer angehangen
        const response = await fetch(apiUrl, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          const entityData = data.data || data;

          // Für NGOs wird entweder principal ODER name als DisplayName verwendet
          if (userType === 'ngos' || userType === 'ngo') {
            if (entityData.principal) return entityData.principal;
            else if (entityData.name) return entityData.name;
          } else {
            // Für Users: Verwende firstName + lastName
            if (entityData.firstName && entityData.lastName)
              return `${entityData.firstName} ${entityData.lastName}`;
            else if (entityData.loginEmail)
              return entityData.loginEmail.split('@')[0];
          }
        }
      }
    } catch (error) {
      console.warn('Could not load user/ngo data:', error);
    }
  }

  // Fallbacks
  if (userType === 'ngos' || userType === 'ngo')
    return userId ? `NGO-${userId.substring(0, 8)}` : 'NGO Account';
  else if (userType === 'users' || userType === 'user')
    return userId ? `User-${userId.substring(0, 8)}` : 'User Account';
  return 'Account';
}
