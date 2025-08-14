import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const { signInWithPassword, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (isSignUp) {
        response = await signUp({ email, password });
      } else {
        response = await signInWithPassword({ email, password });
      }
      if (response.error) {
        setError(response.error.message);
      } else if (response.data.session) {
        navigate('/');
      } else if (isSignUp) {
        setError("Sign up successful! Please check your email to confirm your account.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div>
      <h1>{isSignUp ? 'Create Account' : 'Login'}</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
      </form>

      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>

      <hr style={{margin: '16px 0'}}/>
      <p>Or continue with</p>

      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleFacebookLogin}>Login with Facebook</button>
    </div>
  );
};

export default LoginPage;
