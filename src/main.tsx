import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// Ensure light mode is default on initial page load
// Remove dark class if it exists (shouldn't, but just in case)
if (typeof window !== 'undefined') {
  const root = document.documentElement;
  // Always remove dark class first
  root.classList.remove('dark');
  
  try {
    const savedPreference = localStorage.getItem('dark-mode');
    // Parse the JSON value - it should be a boolean
    const isDark = savedPreference ? JSON.parse(savedPreference) === true : false;
    if (isDark) {
      root.classList.add('dark');
    }
  } catch (error) {
    // If there's an error parsing, default to light mode (dark class already removed)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)



