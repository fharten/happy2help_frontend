'use client';

import { useEffect, useState } from 'react';
import ButtonComponent from '@/components/ButtonComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const LoginFormCard = ({ entity }: { entity: string }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, isLoading: isLoadingUser, loginUser, loginNgo } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials = {
        email: formData.email,
        password: formData.password,
      };

      if (entity === 'users') {
        await loginUser(credentials);
      } else {
        await loginNgo(credentials);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingUser && user) router.push('/');
  }, [isLoadingUser, router, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{entity === 'users' ? 'Account' : 'Verein'} login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className='flex flex-col gap-3'>
              <ButtonComponent
                variant='primary'
                size='md'
                type='submit'
                disabled={isLoading}
                className='w-full'
              >
                {isLoading ? 'Logge Dich ein...' : 'Login'}
              </ButtonComponent>
              <ButtonComponent variant='secondary' size='md' className='w-full'>
                Login mit Google
              </ButtonComponent>
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
