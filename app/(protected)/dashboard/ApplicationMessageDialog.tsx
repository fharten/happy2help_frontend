'use client';

import ButtonComponent from '@/components/ButtonComponent';
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
  triggerText?: string;
};

const messageSchema = z.object({
  reason: z.string().trim().min(10, 'Bitte gib mindestens 10 Zeichen ein.'),
});

const MessageDialog: React.FC<MessageDialogProps> = ({
  onSubmit,
  triggerText = 'Ablehnen',
}) => {
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
        <ButtonComponent variant='danger' size='sm'>
          {triggerText}
        </ButtonComponent>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-light-mint/30 shadow-2xl rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold text-prussian'>
            Bewerbung ablehnen
          </DialogTitle>
          <DialogDescription className='text-prussian/70'>
            Sende dem Bewerber eine Begründung für die Ablehnung.*
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-6' noValidate>
          <div className='grid gap-3'>
            <Label htmlFor='reason' className='text-prussian font-medium'>
              Begründung:
            </Label>
            <Input
              id='reason'
              name='reason'
              placeholder='Begründung hier eingeben'
              value={text}
              onChange={(event) => setText(event.target.value)}
              required
              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
            />
            {errorText && (
              <p className='text-sm text-red-600 font-medium'>{errorText}</p>
            )}
          </div>
          <DialogFooter className='flex gap-3'>
            <DialogClose asChild>
              <ButtonComponent variant='secondary' size='md'>
                Abbrechen
              </ButtonComponent>
            </DialogClose>
            <ButtonComponent variant='solidanger' size='md' type='submit'>
              Absenden
            </ButtonComponent>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
