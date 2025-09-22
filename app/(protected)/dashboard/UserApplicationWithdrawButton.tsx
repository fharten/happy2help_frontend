'use client';

import { useAuth } from '@/contexts/AuthContext';
import ButtonComponent from '@/components/ButtonComponent';
import { toast } from 'sonner';

async function deleteApplication(applicationId: string, accessToken: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/${applicationId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log('Response from server: ', res);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete application');
  }

  if (res.status == 204) {
    toast.success('Du hast deine Bewerbung für das Projekt zurückgezogen.');
    setTimeout(() => {
      location.reload();
    }, 1200);
    return;
  }

  return await res.json();
}

interface PropsType {
  children: React.ReactNode;
  applicationId: string;
}

export function ApplicationWithdrawButton({
  children,
  applicationId,
}: PropsType) {
  const { tokens } = useAuth();

  const handleClick = () => {
    deleteApplication(applicationId, tokens!.accessToken);
  };

  return (
    <ButtonComponent
      variant='primary'
      size='sm'
      onClick={handleClick}
      className='w-full lg:w-auto'
    >
      {children}
    </ButtonComponent>
  );
}

export function ApplicationWithdrawButtonMobile({
  children,
  applicationId,
}: PropsType) {
  const { tokens } = useAuth();

  const handleClick = () => {
    deleteApplication(applicationId, tokens!.accessToken);
  };

  return (
    <ButtonComponent size='sm' onClick={handleClick}>
      {children}
    </ButtonComponent>
  );
}
