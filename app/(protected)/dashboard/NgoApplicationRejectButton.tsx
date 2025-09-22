'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MessageDialog from './ApplicationMessageDialog';
import { updateApplicationStatus } from './NgoApplicationAcceptButton';
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

const ApplicationRejectButton = ({ children, application }: PropsType) => {
  const [submittedText, setSubmittedText] = useState<string | null>(null);
  const { tokens } = useAuth();

  const handleTextSubmit = (text: string): void => {
    setSubmittedText(text);
    if (!text) return;

    void (async () => {
      if (!tokens?.accessToken) return;

      const updatedApplication: Application = {
        ...application,
        status: ApplicationStatus.REJECTED,
        message: text,
      };

      const detailEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/${application.id}`;

      await mutate(
        detailEndpoint,
        (currentApplication: Application | undefined) =>
          currentApplication
            ? { ...currentApplication, status: ApplicationStatus.REJECTED, message: text }
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

  return <MessageDialog onSubmit={handleTextSubmit} />;
};

export default ApplicationRejectButton;
