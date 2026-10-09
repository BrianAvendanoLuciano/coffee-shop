import Button from '@/components/button/button';
import Wrapper from '@/components/form/wrapper';
import Input from '@/components/input';
import HeaderText from '@/components/text/headerText';
import Image from 'next/image';

import CoffeeImage from '@/public/coffee.png';
import { useCoffeeQuote } from '@/hooks/useCoffeeQuotes';
import { useLogin } from '@/lib/queries/auth';
import { loginInputSchema } from '@/lib/schemas';
import type { FieldErrors, LoginInput } from '@/types/common';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type SubmitEvent, useState } from 'react';

type Props = {
  redirectTo?: string;
};

// The same schema the server uses, so client and server validation agree.
function validate(values: LoginInput): FieldErrors<LoginInput> {
  const result = loginInputSchema.safeParse(values);
  if (result.success) return {};

  const errors: FieldErrors<LoginInput> = {};
  for (const issue of result.error.issues) {
    // issue.path[0] is typed as a loose key; narrow it to our field names.
    const field = issue.path[0];
    if (field === 'username' || field === 'password') {
      errors[field] ??= issue.message;
    }
  }
  return errors;
}

export default function SignIn({ redirectTo = '/order' }: Props) {
  const randomQuote = useCoffeeQuote();
  const router = useRouter();
  const login = useLogin();

  // Controlled form: React state owns every field, which is what makes
  // validating as the user types possible.
  const [values, setValues] = useState<LoginInput>({
    username: '',
    password: '',
  });
  // Only show an error for a field once the user has left it (or submitted),
  // not while they are still typing their first character.
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginInput, boolean>>
  >({});

  const errors = validate(values);

  // One handler for every field: the input's `name` picks the key to update.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleBlur = (field: keyof LoginInput) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    // Stop the browser's default full-page form post.
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (Object.keys(errors).length > 0) return;

    login.mutate(values, {
      onSuccess: () => router.replace(redirectTo),
    });
  };

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Wrapper>
          <HeaderText text="Enter your credentials" />
          <p className="mt-2 text-sm text-stone-500">
            Welcome back. Please sign in to your account.
          </p>
          <hr className="w-full shadow-border border-stone-200 shadow-sm my-2" />
          <div className="w-full mt-4 flex items-center justify-center flex-col">
            <Image
              src={CoffeeImage}
              alt=""
              height={100}
              width={100}
              className="justify-center items-center"
            />
            <p className="mt-2 text-sm text-center italic text-stone-500">
              {randomQuote}
            </p>
          </div>

          <form className="my-1 w-full" onSubmit={handleSubmit} noValidate>
            <div className="my-2">
              <Input
                name="username"
                label="Username"
                placeholder="@user"
                autoComplete="username"
                value={values.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                error={touched.username ? errors.username : undefined}
              />
            </div>
            <div className="my-2">
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="@password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : undefined}
              />
            </div>

            {login.error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {login.error.message}
              </p>
            )}

            <div className="mt-4">
              <Button type="submit" disabled={login.isPending}>
                {login.isPending ? 'Signing in…' : 'Login'}
              </Button>
            </div>
          </form>

          <p className="mt-4 text-xs text-stone-500">
            Demo accounts: <code>barista</code> or <code>manager</code>,
            password <code>coffee123</code>
          </p>
        </Wrapper>
      </main>
    </>
  );
}
