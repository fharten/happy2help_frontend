'use client';

import { useAuth } from '@/contexts/AuthContext';
import ButtonComponent from '@/components/ButtonComponent';

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

  // todo: replace by mutate
  location.reload();

  if (res.status == 204) {
    return (
      <>{alert('Du hast deine Bewerbung für das Projekt zurückgezogen.')}</>
    );
  }

  return await res.json();
}

interface PropsType {
  children: any;
  applicationId: string;
}

export function ApplicationWithdrawButton({
  children,
  applicationId,
}: PropsType) {
  const { user, tokens } = useAuth();

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
  const { user, tokens } = useAuth();

  const handleClick = () => {
    deleteApplication(applicationId, tokens!.accessToken);
  };

  return (
    <ButtonComponent size='sm' onClick={handleClick}>
      {children}
    </ButtonComponent>
  );
}
