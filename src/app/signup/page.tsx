"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

// Full countries list
const countries = [
  { label: "Afghanistan", value: "Afghanistan" },
  { label: "Albania", value: "Albania" },
  { label: "Algeria", value: "Algeria" },
  { label: "Andorra", value: "Andorra" },
  { label: "Angola", value: "Angola" },
  { label: "Argentina", value: "Argentina" },
  { label: "Armenia", value: "Armenia" },
  { label: "Australia", value: "Australia" },
  { label: "Austria", value: "Austria" },
  { label: "Azerbaijan", value: "Azerbaijan" },
  { label: "Bahamas", value: "Bahamas" },
  { label: "Bahrain", value: "Bahrain" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Belgium", value: "Belgium" },
  { label: "Brazil", value: "Brazil" },
  { label: "Canada", value: "Canada" },
  { label: "China", value: "China" },
  { label: "Denmark", value: "Denmark" },
  { label: "Estonia", value: "Estonia" },
  { label: "Finland", value: "Finland" },
  { label: "France", value: "France" },
  { label: "Germany", value: "Germany" },
  { label: "India", value: "India" },
  { label: "Japan", value: "Japan" },
  { label: "Mexico", value: "Mexico" },
  { label: "Netherlands", value: "Netherlands" },
  { label: "New Zealand", value: "New Zealand" },
  { label: "Norway", value: "Norway" },
  { label: "Poland", value: "Poland" },
  { label: "Portugal", value: "Portugal" },
  { label: "Singapore", value: "Singapore" },
  { label: "South Africa", value: "South Africa" },
  { label: "Spain", value: "Spain" },
  { label: "Sweden", value: "Sweden" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United States", value: "United States" },
  { label: "Zimbabwe", value: "Zimbabwe" },
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false); // 👈 for hydration fix
  const router = useRouter();

  useEffect(() => {
    setMounted(true); // Now we know we're on client
  }, []);

  const checkUsernameExists = async (username: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    return data !== null;
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isHuman) {
      setError('Please confirm you are not a robot.');
      return;
    }

    if (parseInt(age) < 13) {
      setError('You must be at least 13 years old to sign up.');
      return;
    }

    const usernameTaken = await checkUsernameExists(username);
    if (usernameTaken) {
      setError('Username already exists. Please choose another one.');
      return;
    }

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
    } else {
      const { user } = signupData;
      if (user) {
        await supabase.from('profiles').insert([
          {
            id: user.id,
            username,
            age: parseInt(age),
            location,
          }
        ]);
      }
      alert('Signup successful! Please check your email to confirm.');
      router.push('/login');
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
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

        <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '24px' }}>Create Your Account</h2>

        <form onSubmit={handleSignup}>
          <FormField label="Username" value={username} setValue={setUsername} />
          <FormField label="Email" type="email" value={email} setValue={setEmail} />
          <FormField label="Password" type="password" value={password} setValue={setPassword} />
          <FormField label="Confirm Password" type="password" value={confirmPassword} setValue={setConfirmPassword} />
          <FormField label="Age" type="number" value={age} setValue={setAge} />

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Country</label>
            {mounted && (
              <Select
                options={countries}
                value={countries.find(c => c.value === location)}
                onChange={(selected) => setLocation(selected?.value || '')}
                placeholder="Select your country"
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '5px',
                    borderColor: '#ccc',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999
                  })
                }}
              />
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              <input
                type="checkbox"
                checked={isHuman}
                onChange={(e) => setIsHuman(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              I am not a robot
            </label>
          </div>

          <button type="submit" style={submitButtonStyle}>Sign Up</button>
        </form>

        <button
          onClick={handleGoogleSignup}
          style={{ ...submitButtonStyle, marginTop: '1rem', backgroundColor: '#DB4437' }}
          disabled
        >
          Continue with Google (coming soon)
        </button>

        {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}

function FormField({ label, type = "text", value, setValue }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #ccc',
          borderRadius: '6px',
          fontSize: '16px'
        }}
      />
    </div>
  );
}

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