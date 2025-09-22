'use client';

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
import { z } from 'zod';

type MessageDialogProps = {
  onSubmit: (text: string) => void;
};

const messageSchema = z.object({
  reason: z.string().trim().min(10, 'Bitte gib mindestens 10 Zeichen ein.'),
});

const MessageDialog: React.FC<MessageDialogProps> = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText(null);
    const result = messageSchema.safeParse({ reason: text });
    if (!result.success) {
      const flattened = result.error.flatten();
      const firstError =
        flattened.fieldErrors.reason?.[0] ??
        flattened.formErrors?.[0] ??
        'Ungültige Eingabe';
      setErrorText(firstError);
      return;
    }
    onSubmit(result.data.reason);
    setText('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Ablehnen</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            Sende dem Bewerber eine Begründung für die Ablehnung.*
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4' noValidate>
          <div className='grid gap-3'>
            <Label htmlFor='reason'>Begründung:</Label>
            <Input
              id="reason"
              name="reason"
              placeholder="Begründung hier eingeben"
              value={text}
              onChange={(event) => setText(event.target.value)}
              required
            />
            {errorText && <p className='text-sm text-blue-600'>{errorText}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Abbrechen
              </Button>
            </DialogClose>
            <Button type='submit'>Absenden</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
