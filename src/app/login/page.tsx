"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        // Insert login session into user_sessions table
        await supabase.from('user_sessions').insert([
          {
            user_id: user.id,
            login_time: new Date().toISOString()
          }
        ]);
      }

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/trustpoplogo.svg"
            alt="TrustPop Logo"
            style={{
              height: '100px',
              width: 'auto',
              margin: '0 auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '24px' }}>Welcome Back</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={submitButtonStyle}
          >
            Log In
          </button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '16px',
};

const submitButtonStyle = {
  width: '100%',
  backgroundColor: '#6366f1',
  color: 'white',
  padding: '0.75rem',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
};