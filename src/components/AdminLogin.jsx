// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminLogin({ onLoginSuccess, onBack, darkMode }) {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const email = teacherId.includes('@') ? teacherId : `${teacherId}@ete.ruet.ac.bd`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid Teacher ID or Password.');
    else onLoginSuccess();
  };

  const theme = {
    bg: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#1e293b',
    border: darkMode ? '#334155' : '#ccc',
    inputBg: darkMode ? '#0f172a' : '#ffffff'
  };

  return (
    <div style={{ ...styles.box, backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
      <h2 style={{ color: darkMode ? '#60a5fa' : '#1e3a8a', margin: '0 0 10px 0' }}>ETE Admin Access</h2>
      <p style={{ fontSize: '13px', color: darkMode ? '#cbd5e1' : '#64748b', marginBottom: '15px' }}>RUET Notice Management Console</p>
      {error && <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={styles.form}>
        <input 
          type="text" 
          placeholder="Teacher ID" 
          value={teacherId} 
          onChange={(e) => setTeacherId(e.target.value)} 
          style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} 
          required 
        />
        <button type="submit" style={styles.btn}>Login</button>
        <button type="button" onClick={onBack} style={{ ...styles.backBtn, backgroundColor: darkMode ? '#334155' : '#64748b' }}>
          Back to Notice Board
        </button>
      </form>
    </div>
  );
}

const styles = {
  box: { maxWidth: '360px', margin: '80px auto', padding: '24px', border: '1px solid', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' },
  input: { padding: '11px', borderRadius: '6px', border: '1px solid', fontSize: '14px', outline: 'none' },
  btn: { padding: '11px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  backBtn: { padding: '11px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
};