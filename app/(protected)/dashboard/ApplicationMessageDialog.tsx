'use client';

import ButtonComponent from '@/components/ButtonComponent';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';

type MessageDialogProps = {
  onSubmit: (text: string) => void;
};

const MessageDialog: React.FC<MessageDialogProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {(event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); }
    if (text.trim()) {
      onSubmit(text); // Text weitergeben
      setText(''); // Eingabefeld leeren
    }
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant='outline'>Ablehnen</Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
              Sende dem Bewerber eine Begründung für die Ablehnung.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='grid gap-3'>
              <Label htmlFor='reason'>Begründung:</Label>
              <Input
                id='reason'
                name='reason'
                placeholder='Dein Text hier'
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Abbrechen</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleSubmit}>Absenden</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default MessageDialog;
