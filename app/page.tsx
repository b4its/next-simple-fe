// src/app/page.js atau src/pages/index.js

'use client';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack'; // Digunakan untuk menata tombol dan memberikan jarak
// Tidak perlu Box atau komponen lain jika sudah menggunakan 'div'
// import Box from '@mui/material/Box'; 


export default function Home() {
  return (
    // Menggunakan elemen <div> standar dengan styling inline
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Simply Schools Apps
      </Typography>
      <Stack spacing={2} direction="row">
        {/*
          'spacing={2}' akan menambahkan jarak sesuai nilai tema (biasanya 8px * 2 = 16px)
          'direction="row"' membuat tombol berjejer horizontal.
          Ganti menjadi 'direction="column"' (atau hapus) jika ingin vertikal.
        */}
        <Button variant="contained" color="primary" href="/student">
          Student
        </Button>
        <Button variant="contained" color="primary" href="/teacher">
          Teacher 
        </Button>
      </Stack>
    </div>
  );
}