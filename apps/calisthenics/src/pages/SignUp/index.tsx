import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import TextField from '../../components/TextField';
import { useSignUp } from '../../queries/auth';

const MIN_PASSWORD = 8;

/** Create an account (MOCK-207 v2). The dashboard then offers the level test (first launch). */
const SignUp = () => {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout
      title="Créer ton compte"
      intro="Ton programme, tes séances et ta progression, sur tous tes appareils."
      footer={
        <>
          Déjà un compte ?{' '}
          <Link to="/connexion" className="font-semibold text-primary-100 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          signUp.mutate(
            { name: name.trim(), email: email.trim(), password },
            { onSuccess: () => navigate('/', { replace: true }) },
          );
        }}
      >
        <TextField
          id="name"
          label="Prénom"
          autoComplete="given-name"
          required
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          hint={`${MIN_PASSWORD} caractères minimum.`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <ErrorMessage error={signUp.error} />
        <Button
          type="submit"
          variant="accent"
          size="lg"
          iconRight={faArrowRight}
          className="w-full"
          loading={signUp.isPending}
        >
          Créer mon compte
        </Button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
