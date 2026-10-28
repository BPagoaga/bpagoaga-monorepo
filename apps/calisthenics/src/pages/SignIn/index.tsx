import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { safeReturnPath } from '../../components/RequireAuth/returnPath';
import TextField from '../../components/TextField';
import { useSignIn } from '../../queries/auth';

/** Sign in (MOCK-207). Back to the page the user came from, or the dashboard. */
const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signIn = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout
      title="Content de te revoir"
      intro="Connecte-toi pour retrouver ton programme et ton journal."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-primary-100 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          signIn.mutate(
            { email: email.trim(), password },
            { onSuccess: () => navigate(safeReturnPath(searchParams.get('retour')), { replace: true }) },
          );
        }}
      >
        <TextField
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          id="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <ErrorMessage error={signIn.error} />
        <Button
          type="submit"
          variant="accent"
          size="lg"
          iconRight={faArrowRight}
          className="w-full"
          loading={signIn.isPending}
        >
          Se connecter
        </Button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
