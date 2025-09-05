'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const LoginFormCard = ({ entity }: { entity: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleSubmit = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${entity}/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!res.ok) return toast.error('Email oder Passwort falsch');
    router.push('/projects');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{entity === 'users' ? 'Account' : 'Verein'} login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault(); // prevent full page reload
            await handleSubmit();
          }}
        >
          <div className='flex flex-col gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='m@example.com'
                required
              />
            </div>
            <div className='grid gap-3'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Passwort</Label>
                <a
                  href='#'
                  className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                >
                  Passwort vergessen?
                </a>
              </div>
              <Input
                id='password'
                type='password'
                placeholder='******'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className='flex flex-col gap-3'>
              <Button type='submit' className='w-full'>
                Login
              </Button>
              <Button variant='outline' className='w-full'>
                Login mit Google
              </Button>
            </div>
          </div>
          <div className='mt-4 text-center text-sm'>
            Du hast noch keinen Account?{' '}
            <a href='#' className='underline underline-offset-4'>
              Registrieren
            </a>
          </div>
        </form>
      </CardContent>
      <Toaster position='top-center' richColors />
    </Card>
  );
};

export default LoginFormCard;
