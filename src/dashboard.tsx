import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './dashboard/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import { initializeDatabase } from './services/db';
import './index.css';

// Initialize the database
initializeDatabase().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  </React.StrictMode>
);
