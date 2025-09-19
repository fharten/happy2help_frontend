'use client';

import { useState } from 'react';
import ButtonComponent from '@/components/ButtonComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface UserRegistrationBody {
  email: string;
  password: string;
}

interface NgoRegistrationBody {
  name: string;
  principal: string;
  email: string;
  password: string;
}

type RegistrationBody = UserRegistrationBody | NgoRegistrationBody;

const RegistrationFormCard = ({ entity }: { entity: 'user' | 'ngo' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [principal, setPrincipal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    let url = '';
    let body: RegistrationBody;

    if (entity === 'user') {
      url = `${baseUrl}/api/auth/users/register`;
      body = { email, password };
    } else {
      url = `${baseUrl}/api/auth/ngos/register`;
      body = {
        name,
        email,
        password,
        principal,
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      toast.error('Registrierung fehlgeschlagen');
      return;
    }
    toast.success('Registrierung erfolgreich!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {entity === 'user' ? 'Nutzer registrieren' : 'Verein registrieren'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4'>
            {entity === 'ngo' && (
              <>
                <div className='grid gap-2'>
                  <Label htmlFor='vereinName'>Vereinsname</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='Verein e.V.'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='principal'>Name des Vorstands</Label>
                  <Input
                    id='principal'
                    type='text'
                    placeholder='Max Mustermann'
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className='grid gap-2'>
              <Label htmlFor='email'>E-Mail</Label>
              <Input
                id='email'
                type='email'
                placeholder='max@beispiel.de'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Passwort</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <ButtonComponent
              variant='primary'
              size='md'
              type='submit'
              className='w-full'
            >
              Registrieren
            </ButtonComponent>
          </div>
        </form>
      </CardContent>
      <Toaster position='top-center' richColors />
    </Card>
  );
};

export default RegistrationFormCard;
