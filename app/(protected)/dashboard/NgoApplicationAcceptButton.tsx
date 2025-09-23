'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ButtonComponent from '@/components/ButtonComponent';
import { Application } from '@/types/application';
import { mutate } from 'swr';

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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/${application.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: application.id,
        status: application.status,
        message: application.message,
      }),
    }
  );

  if (!response.ok) {
    let message = 'Failed to update application status';
    try {
      const errorPayload = await response.json();
      message = errorPayload?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  return response.status;
}

export function ApplicationAcceptButton({ children, application }: PropsType) {
  const { tokens } = useAuth();

  const handleClick = (): void => {
    void (async () => {
      if (!tokens?.accessToken) return;

      const updatedApplication = {
        ...application,
        status: ApplicationStatus.ACCEPTED,
      };
      const detailEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/${application.id}`;

      await mutate(
        detailEndpoint,
        (currentApplication: Application | undefined) =>
          currentApplication
            ? { ...currentApplication, status: ApplicationStatus.ACCEPTED }
            : currentApplication,
        { revalidate: false }
      );

      await updateApplicationStatus(updatedApplication, tokens.accessToken);

      mutate(detailEndpoint);

      if (application?.project?.ngoId) {
        mutate(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${application.project.ngoId}/applications`
        );
      }
    })();
  };

  return (
    <ButtonComponent
      variant='primary'
      size='sm'
      onClick={handleClick}
      type='button'
    >
      {children}
    </ButtonComponent>
  );
}
