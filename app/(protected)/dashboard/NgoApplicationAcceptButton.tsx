'use client';

import { useAuth } from '@/contexts/AuthContext';
import ButtonComponent from '@/components/ButtonComponent';
import { Application } from '@/types/application';

enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

interface PropsType {
  children: React.ReactNode;
  application: Application;
}

export async function updateApplicationStatus(
  application: Application,
  accessToken: string
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/${application.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(application),
    }
  );
  console.log('Response from server: ', res);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update application status');
  }

  // todo: replace by mutate
  location.reload();

  return res.status;
}

export function ApplicationAcceptButton({ children, application }: PropsType) {
  const { tokens } = useAuth();
  application.status = ApplicationStatus.ACCEPTED;

  const handleClick = () => {
    updateApplicationStatus(application, tokens!.accessToken);
  };

  return (
    <ButtonComponent size='sm' onClick={handleClick}>
      {children}
    </ButtonComponent>
  );
}
