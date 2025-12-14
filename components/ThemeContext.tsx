// src/components/ThemeContext.tsx
'use client';

import React, { createContext, useMemo, useState, useContext, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Definisikan tipe untuk context
interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

// Buat Context
export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

// Provider untuk Context
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  const colorMode = useMemo(
    () => ({
      // Fungsi untuk mengubah mode
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
      },
      mode,
    }),
    [mode],
  );

  // Buat tema berdasarkan mode saat ini
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // Anda bisa menambahkan kustomisasi warna lain di sini
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline untuk mengatur ulang CSS dasar, penting untuk Dark Mode */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Hook kustom untuk menggunakan Context
export const useColorMode = () => useContext(ColorModeContext);