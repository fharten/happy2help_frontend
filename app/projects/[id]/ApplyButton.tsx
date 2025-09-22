'use client';

import { useAuth } from '@/contexts/AuthContext';
import ButtonComponent from '@/components/ButtonComponent';
import { toast } from 'sonner';

interface ApplicationData {
  projectId: string;
  userId: string;
}

async function createApplication(data: ApplicationData, accessToken: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );
  console.log('Response from server: ', res);

  // you can't apply more than once
  if (res.status == 409 && res.statusText == 'Conflict') {
    toast.warning('Du hast dich bereits für dieses Projekt beworben!');
    return;
  }

  if (!res.ok) {
    const error = await res.json();
    toast.error(error.message || 'Fehler beim Erstellen der Bewerbung');
    throw new Error(error.message || 'Failed to create application');
  }

  if (res.status == 201 && res.statusText == 'Created') {
    toast.success(
      'Du hast dich erfolgreich beworben! Der Verein wird über deine Bewerbung informiert.'
    );
    return;
  }

  const newApplication = await res.json();
  return newApplication;
}

interface PropsType {
  children: React.ReactNode;
  projectId: string;
}

export default function ApplyButton({ children, projectId }: PropsType) {
  const { user, tokens } = useAuth();

  const applicationData = {
    projectId: projectId,
    userId: user!.id,
  };

  const handleClick = async () => {
    try {
      await createApplication(applicationData, tokens!.accessToken);
    } catch (error) {
      console.error('Error creating application:', error);
    }
  };

  return (
    <ButtonComponent
      variant='primary'
      size='lg'
      onClick={handleClick}
      className='w-full lg:w-auto'
    >
      {children}
    </ButtonComponent>
  );
}
