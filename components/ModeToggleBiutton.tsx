// src/components/ModeToggleButton.tsx
'use client';

import React from 'react';
import { useColorMode } from './ThemeContext'; // Import hook kustom
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icon untuk Dark Mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icon untuk Light Mode
import Tooltip from '@mui/material/Tooltip';

export default function ModeToggleButton() {
  const { mode, toggleColorMode } = useColorMode();

  const isLight = mode === 'light';
  const label = isLight ? 'Beralih ke Dark Mode' : 'Beralih ke Light Mode';

  return (
    <Box>
      <Tooltip title={label}>
        <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
          {/* Tampilkan icon yang berbeda tergantung mode saat ini */}
          {isLight ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}