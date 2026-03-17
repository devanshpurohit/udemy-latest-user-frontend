import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    logoUrl: '/logo.png',
    footerContent: 'UDEMY is a leading online learning platform dedicated to providing high-quality courses to students worldwide.',
    siteName: 'UDEMY'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
      const response = await axios.get(`${apiUrl}/settings`);
      
      if (response.data.success) {
        const data = response.data.data;
        const baseUrl = apiUrl.replace('/api', '');
        
        setSettings({
          ...data,
          logoUrl: data.logoUrl?.startsWith('http') ? data.logoUrl : `${baseUrl}${data.logoUrl}`
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    
    // Listen for custom event if settings are updated in the same session
    // (though usually admin and student are separate apps)
    window.addEventListener('siteSettingsUpdated', fetchSettings);
    return () => window.removeEventListener('siteSettingsUpdated', fetchSettings);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
