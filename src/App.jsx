// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import StudentView from './components/StudentView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [view, setView] = useState('student'); 
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setView('admin');
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView('admin');
      else setView('student');
    });
  }, []);

  useEffect(() => {
    // Force the document body to inherit full height background properties cleanly
    if (darkMode) {
      document.body.style.backgroundColor = '#0f172a';
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.style.backgroundColor = '#f8fafc';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('student');
  };

  const themeProps = { darkMode, setDarkMode };

  // Set background wrappers to avoid half-screen color splits
  const pageWrapperStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
    margin: 0,
    padding: 0
  };

  return (
    <div style={pageWrapperStyle}>
      {view === 'login' && <AdminLogin onLoginSuccess={() => setView('admin')} onBack={() => setView('student')} {...themeProps} />}
      {view === 'admin' && session && <AdminDashboard onLogout={handleLogout} {...themeProps} />}
      {view === 'student' && <StudentView onAdminLoginClick={() => setView(session ? 'admin' : 'login')} {...themeProps} />}
    </div>
  );
}