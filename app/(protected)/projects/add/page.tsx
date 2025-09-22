'use client';
import { EntityNgoRoute } from '@/components/auth/ProtectedRoute';
import { ProjectForm } from '@/components/CreateAndEditForm';

export default function AddNewProject() {
  return (
    <EntityNgoRoute>
      <ProjectForm isUpdate={false} />
    </EntityNgoRoute>
  );
}
