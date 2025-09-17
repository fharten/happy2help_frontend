'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole, hasEntityType } from '@/lib/user-utils';
import { AuthUser } from '@/types/auth';
import useSWR from 'swr';

// Define the resource types
interface ProjectResource {
  id: string;
  ngoId: string;
  name: string;
  [key: string]: unknown;
}

interface ApplicationResource {
  id: string;
  userId: string;
  project?: {
    ngoId: string;
  };
  [key: string]: unknown;
}

interface NotificationResource {
  id: string;
  userId?: string;
  ngoId?: string;
  [key: string]: unknown;
}

interface UserResource {
  id: string;
  [key: string]: unknown;
}

type ResourceData =
  | ProjectResource
  | ApplicationResource
  | NotificationResource
  | UserResource;

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
      return;
    }

    if (!user || !isAuthenticated) {
      router.push(
        `${fallbackPath}?redirect=${encodeURIComponent(
          window.location.pathname,
        )}`,
      );
      return;
    }

    if (customCheck && !customCheck(user)) {
      router.push('/unauthorized');
      return;
    }
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

// Helper function to check resource ownership
function checkResourceOwnership(
  user: AuthUser,
  resource: ResourceData,
  resourceType: string,
): boolean {
  if (!resource) return false;

  switch (resourceType) {
    case 'project': {
      const projectResource = resource as ProjectResource;
      const isOwner =
        hasEntityType(user, 'ngo') && projectResource.ngoId === user.id;
      return isOwner;
    }

    case 'application': {
      const applicationResource = resource as ApplicationResource;
      // User owns application if application.userId === user.id
      if (
        hasEntityType(user, 'user') &&
        applicationResource.userId === user.id
      ) {
        return true;
      }
      // NGO owns the project the application is for
      if (
        hasEntityType(user, 'ngo') &&
        applicationResource.project?.ngoId === user.id
      ) {
        return true;
      }
      return false;
    }

    case 'notification': {
      const notificationResource = resource as NotificationResource;
      const canAccess =
        notificationResource.userId === user.id ||
        notificationResource.ngoId === user.id;
      return canAccess;
    }

    case 'user': {
      const userResource = resource as UserResource;

      // User owns their own profile
      if (hasEntityType(user, 'user') && userResource.id === user.id) {
        return true;
      }
      // NGOs can view any user profile
      if (hasEntityType(user, 'ngo')) {
        return true;
      }
      return false;
    }

    default:
      return false;
  }
}

// RESOURCE OWNER ROUTE - Dynamic ownership checking
export function ResourceOwnerRoute({
  children,
  resourceType,
  allowedRoles = ['admin'],
  fallbackPath = '/login',
  loadingComponent = (
    <div className='flex items-center justify-center min-h-screen'>
      Loading...
    </div>
  ),
}: ProtectedRouteProps & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
  allowedRoles?: string[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const resourceId = params?.id as string;

  // Check if user has admin role that bypasses ownership
  const hasAdminRole = user && allowedRoles.some((role) => hasRole(user, role));

  // Construct the API URL
  const apiUrl =
    user && resourceId && !hasAdminRole
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/${resourceType}s/${resourceId}`
      : null;

  // Fetch the resource to check ownership
  const {
    data: resourceData,
    isLoading: isLoadingResource,
    error,
  } = useSWR<ResourceData>(apiUrl);

  useEffect(() => {
    if (!user || !isAuthenticated) {
      router.push(
        `${fallbackPath}?redirect=${encodeURIComponent(
          window.location.pathname,
        )}`,
      );
      return;
    }

    if (!resourceId) {
      router.push('/unauthorized');
      return;
    }

    if (hasAdminRole) return;

    // Only check ownership if we have resource data
    if (resourceData) {
      const isOwner = checkResourceOwnership(user, resourceData, resourceType);

      if (!isOwner) {
        router.push('/unauthorized');
        return;
      }
    } else if (error) {
      router.push('/unauthorized');
      return;
    }
    // If resourceData is still null/undefined but no error, keep loading
  }, [
    user,
    isLoading,
    isAuthenticated,
    resourceId,
    hasAdminRole,
    resourceData,
    isLoadingResource,
    error,
    router,
    fallbackPath,
    resourceType,
  ]);

  if (isLoading || (user && !hasAdminRole && isLoadingResource)) {
    return <>{loadingComponent}</>;
  }

  if (!user || !isAuthenticated || !resourceId) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Error</h2>
          <p>Failed to load resource data</p>
        </div>
      </div>
    );
  }

  // If admin role, allow access without ownership check
  if (hasAdminRole) {
    return <>{children}</>;
  }

  // If we have resource data, check ownership
  if (resourceData) {
    const isOwner = checkResourceOwnership(user, resourceData, resourceType);

    if (!isOwner) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-2'>Access Denied</h2>
            <p>You don&apos;t have permission to access this resource.</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  return <>{loadingComponent}</>;
}

// RESOURCE-SPECIFIC OWNER ROUTES (Strict ownership only)
export function ProjectOwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ResourceOwnerRoute resourceType='project' allowedRoles={[]} {...props}>
      {children}
    </ResourceOwnerRoute>
  );
}

export function ApplicationOwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ResourceOwnerRoute resourceType='application' allowedRoles={[]} {...props}>
      {children}
    </ResourceOwnerRoute>
  );
}

export function NotificationOwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ResourceOwnerRoute
      resourceType='notification'
      allowedRoles={[]}
      {...props}
    >
      {children}
    </ResourceOwnerRoute>
  );
}

// USER-SPECIFIC ROUTES (For user profiles with special access rules)
export function UserOwnerOnlyRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) => {
        const pathParts = window.location.pathname.split('/');
        const userIndex = pathParts.findIndex((part) => part === 'users');

        // WORKS FOR /users/:userId AND /users/:userId/edit
        const userId =
          userIndex !== -1 && userIndex + 1 < pathParts.length
            ? pathParts[userIndex + 1]
            : null;

        // Only the user themselves can access (must be user entity AND own profile)
        const canAccess = hasEntityType(user, 'user') && user.id === userId;
        return canAccess;
      }}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

export function UserOwnerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'>) {
  return (
    <ProtectedRoute
      customCheck={(user) => {
        const pathParts = window.location.pathname.split('/');
        const userId = pathParts[pathParts.length - 1];

        // Admin can access any user profile
        if (hasRole(user, 'admin')) return true;

        // User can access their own profile
        if (hasEntityType(user, 'user') && user.id === userId) return true;

        // NGO can access any user profile
        if (hasEntityType(user, 'ngo')) return true;

        return false;
      }}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

// STRICT RESOURCE OWNERSHIP ROUTES (Only resource owners, no admin/NGO bypass)
export function OnlyResourceOwnerRoute({
  children,
  resourceType,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
}) {
  if (resourceType === 'user') {
    return <UserOwnerOnlyRoute {...props}>{children}</UserOwnerOnlyRoute>;
  }

  return (
    <ResourceOwnerRoute
      resourceType={resourceType}
      allowedRoles={[]} // No admin bypass
      {...props}
    >
      {children}
    </ResourceOwnerRoute>
  );
}

// RESOURCE OWNER + ENTITY NGO (Owner OR any NGO)
export function ResourceOwnerOrEntityNgoRoute({
  children,
  resourceType,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
}) {
  if (resourceType === 'user') {
    return (
      <ProtectedRoute
        customCheck={(user) => {
          const pathParts = window.location.pathname.split('/');
          const userId = pathParts[pathParts.length - 1];

          // User owns their own profile OR any NGO can access
          return (
            (hasEntityType(user, 'user') && user.id === userId) ||
            hasEntityType(user, 'ngo')
          );
        }}
        {...props}
      >
        {children}
      </ProtectedRoute>
    );
  }

  return (
    <ResourceOwnerRoute
      resourceType={resourceType}
      allowedRoles={[]} // No admin bypass
      {...props}
    >
      <ProtectedRoute customCheck={(user) => hasEntityType(user, 'ngo')}>
        {children}
      </ProtectedRoute>
    </ResourceOwnerRoute>
  );
}

// RESOURCE OWNER + ADMIN (Owner OR admin)
export function ResourceOwnerOrAdminRoute({
  children,
  resourceType,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
}) {
  if (resourceType === 'user') {
    return (
      <ProtectedRoute
        customCheck={(user) => {
          const pathParts = window.location.pathname.split('/');
          const userId = pathParts[pathParts.length - 1];

          // User owns their own profile OR admin can access
          return (
            (hasEntityType(user, 'user') && user.id === userId) ||
            hasRole(user, 'admin')
          );
        }}
        {...props}
      >
        {children}
      </ProtectedRoute>
    );
  }

  return (
    <ResourceOwnerRoute
      resourceType={resourceType}
      allowedRoles={['admin']} // Admin can bypass ownership
      {...props}
    >
      {children}
    </ResourceOwnerRoute>
  );
}

// ENTITY TYPE ROUTES
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

// ADMIN ROUTES
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

// LEGACY COMBINATION ROUTES (Updated for clarity)
export function OwnerOrNgoRoute({
  children,
  resourceType,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
}) {
  return (
    <ResourceOwnerOrEntityNgoRoute resourceType={resourceType} {...props}>
      {children}
    </ResourceOwnerOrEntityNgoRoute>
  );
}

export function OwnerOrAdminRoute({
  children,
  resourceType,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
}) {
  return (
    <ResourceOwnerOrAdminRoute resourceType={resourceType} {...props}>
      {children}
    </ResourceOwnerOrAdminRoute>
  );
}

export function OwnerOrAdminOrNgoRoute({
  children,
  resourceType,
  ...props
}: Omit<ProtectedRouteProps, 'customCheck'> & {
  resourceType: 'project' | 'application' | 'notification' | 'user';
}) {
  if (resourceType === 'user') {
    return <UserOwnerRoute {...props}>{children}</UserOwnerRoute>;
  }

  return (
    <ResourceOwnerRoute
      resourceType={resourceType}
      allowedRoles={['admin']} // Admin can bypass ownership
      {...props}
    >
      <ProtectedRoute customCheck={(user) => hasEntityType(user, 'ngo')}>
        {children}
      </ProtectedRoute>
    </ResourceOwnerRoute>
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
  requireAllRoles?: boolean;
  requireAllEntityTypes?: boolean;
  customLogic?: (user: AuthUser) => boolean;
}) {
  return (
    <ProtectedRoute
      customCheck={(user) => {
        if (customLogic) {
          return customLogic(user);
        }

        let roleCheck = true;
        let entityCheck = true;

        if (requiredRoles.length > 0) {
          if (requireAllRoles) {
            roleCheck = requiredRoles.every((role) => hasRole(user, role));
          } else {
            roleCheck = requiredRoles.some((role) => hasRole(user, role));
          }
        }

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
