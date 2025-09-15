import { ProjectOwnerRoute } from '@/components/auth/ProtectedRoute';
import { ProjectForm } from '@/components/CreateAndEditForm';

const ProjectEditPage = () => {
  return (
    <ProjectOwnerRoute>
      <ProjectForm isUpdate />
    </ProjectOwnerRoute>
  );
};

export default ProjectEditPage;
