import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from './client';
import type { ISignInInput, ISignUpInput } from './types';

export type * from './types';

// Hand-written: Better Auth's routes are not in the OpenAPI document the rest of the client is generated from.
export const AuthQueryKeys = { Session: 'auth-session' } as const;
export const AuthStaleTimeEnum = { Session: 5 * 60_000 } as const;

// Better Auth error codes → French messages; anything else falls back to a generic one.
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou mot de passe incorrect.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cet e-mail. Connecte-toi.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Un compte existe déjà avec cet e-mail. Connecte-toi.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit faire au moins 8 caractères.',
  PASSWORD_TOO_LONG: 'Le mot de passe est trop long.',
  INVALID_EMAIL: 'Cette adresse e-mail n’est pas valide.',
};

const fail = (error: { code?: string; status: number }): never => {
  throw new Error(
    (error.code && MESSAGES[error.code]) ??
      (error.status === 429
        ? 'Trop de tentatives. Patiente une minute avant de réessayer.'
        : 'Impossible de te connecter pour le moment. Réessaie dans un instant.'),
  );
};

/** The signed-in user, or null. */
export const useFetchAuthSession = () =>
  useQuery({
    queryKey: [AuthQueryKeys.Session],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();
      if (error) return fail(error);
      return data;
    },
    staleTime: AuthStaleTimeEnum.Session,
  });

/** Signing in or out changes whose data every query holds: start from an empty cache. */
const useAuthMutation = <TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== AuthQueryKeys.Session });
      await queryClient.refetchQueries({ queryKey: [AuthQueryKeys.Session] });
    },
  });
};

export const useSignIn = () =>
  useAuthMutation(async ({ email, password }: ISignInInput) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) fail(error);
  });

export const useSignUp = () =>
  useAuthMutation(async ({ name, email, password }: ISignUpInput) => {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) fail(error);
  });

export const useSignOut = () =>
  useAuthMutation(async () => {
    const { error } = await authClient.signOut();
    if (error) fail(error);
  });
