'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MessageDialog from './ApplicationMessageDialog';
import { updateApplicationStatus } from './NgoApplicationAcceptButton';
import { Application } from '@/types/application';

enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

interface PropsType {
  children: any;
  application: Application;
}

const ApplicationRejectButton = ({ children, application }: PropsType) => {
  const [submittedText, setSubmittedText] = useState<string | null>(null);

  const { tokens } = useAuth();

  const handleTextSubmit = async (text: string) => {
    debugger;
    console.log('Empfangener Text:', text);
    setSubmittedText(text);

    if (text) {
      application.status = ApplicationStatus.REJECTED;
      application.message = text;

      const httpStatusCode = await updateApplicationStatus(
        application,
        tokens!.accessToken
      );
    }
  };

  return (
    <div>
      <MessageDialog onSubmit={handleTextSubmit} />
    </div>
  );
};

export default ApplicationRejectButton;
