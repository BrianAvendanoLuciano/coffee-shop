import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { mockFetch, renderWithProviders } from '@/test/utils';
import SignIn from './signIn';

const replace = vi.fn();

// The router only exists inside a running Next.js app, so tests replace it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

// React Testing Library tests what a user can see and do: find elements by
// their label or role, type and click like a person would, and assert on the
// screen. Nothing here knows about state or hooks, so the tests keep passing
// when the implementation is refactored.
describe('SignIn', () => {
  it('shows validation errors and does not call the server', async () => {
    const user = userEvent.setup();
    const { fetchMock } = mockFetch({});
    renderWithProviders(<SignIn />);

    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 6 characters'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInvalid();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('signs in and redirects to where the user was going', async () => {
    const user = userEvent.setup();
    const { calls } = mockFetch({
      'POST /api/auth/login': {
        body: { user: { id: 'emp-001', name: 'Bea Santos', role: 'BARISTA' } },
      },
    });
    renderWithProviders(<SignIn redirectTo="/report" />);

    await user.type(screen.getByLabelText('Username'), 'barista');
    await user.type(screen.getByLabelText('Password'), 'coffee123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/report'));
    expect(calls[0]?.body).toEqual({
      username: 'barista',
      password: 'coffee123',
    });
  });

  it('shows the server message when the credentials are wrong', async () => {
    const user = userEvent.setup();
    mockFetch({
      'POST /api/auth/login': {
        status: 401,
        body: {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Wrong username or password.',
          },
        },
      },
    });
    renderWithProviders(<SignIn />);

    await user.type(screen.getByLabelText('Username'), 'barista');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(
      await screen.findByText('Wrong username or password.'),
    ).toBeInTheDocument();
  });
});
