'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, hasEntityType } from '@/lib/user-utils';
import { AuthUser } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
  loadingComponent?: ReactNode;
  customCheck?: (user: AuthUser) => boolean;
}

// BASE PROTECTEDROUTE COMPONENT WITH CUSTOM CHECK FUNCTION
export function ProtectedRoute({
  children,
  fallbackPath = '/login',
  loadingComponent = (
    <div className='flex items-center justify-center min-h-screen'>
      Loading...
    </div>
  ),
  customCheck,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log('Still loading, not checking auth yet');
      return;
    }

    if (!user || !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push(
        `${fallbackPath}?redirect=${encodeURIComponent(
          window.location.pathname,
        )}`,
      );
      return;
    }

    if (customCheck && !customCheck(user)) {
      console.log('Custom check failed, redirecting to unauthorized');
      //router.push('/unauthorized');
      return;
    }

    console.log('All checks passed, user can access this route');
  }, [user, isLoading, isAuthenticated, customCheck, router, fallbackPath]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (!user || !isAuthenticated) {
    return <>{loadingComponent}</>;
  }

  if (customCheck && !customCheck(user)) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
}

// 1. OWNER ONLY
export function OwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute customCheck={(user) => hasRole(user, 'owner')} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// 2. ENTITY USER (user entity type)
export function EntityUserRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) => hasEntityType(user, 'user')}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// 3. ENTITY NGO (ngo entity type)
export function EntityNgoRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) => hasEntityType(user, 'ngo')}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// 4. OWNER OR NGO
export function OwnerOrNgoRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) =>
        hasRole(user, 'owner') || hasEntityType(user, 'ngo')
      }
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// 5. OWNER & ENTITY USER (must be both owner role AND user entity)
export function OwnerAndEntityUserRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) =>
        hasRole(user, 'owner') && hasEntityType(user, 'user')
      }
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// 6. OWNER & ENTITY NGO (must be both owner role AND ngo entity)
export function OwnerAndEntityNgoRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) =>
        hasRole(user, 'owner') && hasEntityType(user, 'ngo')
      }
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// 7. ADMIN ONLY
export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute customCheck={(user) => hasRole(user, 'admin')} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// 8. ADMIN OR OWNER
export function AdminOrOwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) => hasRole(user, 'admin') || hasRole(user, 'owner')}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// 9. ADMIN OR ENTITY NGO
export function AdminOrEntityNgoRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) =>
        hasRole(user, 'admin') || hasEntityType(user, 'ngo')
      }
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// GENERIC MULTI-CONDITION ROUTE FOR COMPLEX SCENARIOS
export function MultiConditionRoute({
  children,
  requiredRoles = [],
  requiredEntityTypes = [],
  requireAllRoles = false,
  requireAllEntityTypes = false,
  customLogic,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  requiredRoles?: string[];
  requiredEntityTypes?: ('user' | 'ngo')[];
  requireAllRoles?: boolean; // true = AND, false = OR
  requireAllEntityTypes?: boolean; // true = AND, false = OR
  customLogic?: (user: AuthUser) => boolean;
}) {
  return (
    <ProtectedRoute
      customCheck={(user) => {
        // CUSTOM LOGIC TAKES PRECEDENCE
        if (customLogic) {
          return customLogic(user);
        }

        let roleCheck = true;
        let entityCheck = true;

        // CHECK ROLES
        if (requiredRoles.length > 0) {
          if (requireAllRoles) {
            roleCheck = requiredRoles.every((role) => hasRole(user, role));
          } else {
            roleCheck = requiredRoles.some((role) => hasRole(user, role));
          }
        }

        // CHECK ENTITY TYPES
        if (requiredEntityTypes.length > 0) {
          if (requireAllEntityTypes) {
            entityCheck = requiredEntityTypes.every((entityType) =>
              hasEntityType(user, entityType),
            );
          } else {
            entityCheck = requiredEntityTypes.some((entityType) =>
              hasEntityType(user, entityType),
            );
          }
        }

        return roleCheck && entityCheck;
      }}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}
