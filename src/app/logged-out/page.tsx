"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoggedOutPage() {
  const router = useRouter();
  const [sessionDuration, setSessionDuration] = useState<number | null>(null);

  useEffect(() => {
    const durationString = localStorage.getItem('sessionDuration');
    if (durationString) {
      setSessionDuration(parseInt(durationString));
      localStorage.removeItem('sessionDuration'); // Clean after reading
    }
  }, []);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
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

        <h2 style={{ fontSize: '22px', marginBottom: '1rem', lineHeight: '1.3' }}>
          You have successfully logged out
        </h2>

        {sessionDuration !== null && (
          <p style={{ fontSize: '16px', marginBottom: '2rem' }}>
            Your session lasted {formatDuration(sessionDuration)}
          </p>
        )}

        <button
          onClick={handleGoToLogin}
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Go to Login
        </button>

      </div>
    </div>
  );
}