// src/app/student/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ModeToggleButton from '../../components/ModeToggleBiutton'; 
import CircularProgress from '@mui/material/CircularProgress'; // Untuk indikator loading

// --- Tipe Data Disesuaikan dengan API Rust ---
interface StudentData {
    id: string; // ObjectId di Rust, jadi string di frontend
    name: string;
    major: string;
    enrollment_year: number;
}

const columns: GridColDef<StudentData>[] = [
    { field: 'id', headerName: 'ID', width: 220 }, 
    { field: 'name', headerName: 'Nama', width: 180 },
    { field: 'major', headerName: 'Jurusan', width: 150 },
    {
        field: 'enrollment_year',
        headerName: 'Tahun Masuk',
        type: 'number',
        width: 130,
    },
];

const paginationModel = { page: 0, pageSize: 5 };

// --- Komponen Halaman ---
export default function StudentPage() {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Panggil API Rust di localhost:8080
                const response = await fetch('http://127.0.0.1:8080/api/v1/students');
                
                if (!response.ok) {
                    throw new Error(`Gagal mengambil data: Status ${response.status}`);
                }
                
                const data: StudentData[] = await response.json();
                
                // Pastikan data yang diterima adalah array
                if (Array.isArray(data)) {
                    setStudents(data);
                } else {
                    throw new Error("Format data tidak valid (bukan array).");
                }
            } catch (err) {
                // Tampilkan pesan error di konsol
                console.error("Kesalahan saat mengambil data mahasiswa:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Terjadi kesalahan yang tidak diketahui saat mengambil data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []); // Array kosong berarti useEffect hanya berjalan sekali setelah render awal

    // --- Tampilkan Loading State ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Memuat Data dari API Rust...</Typography>
            </Box>
        );
    }

    // --- Tampilkan Error State ---
    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
                <Typography color="error" variant="h5" gutterBottom>
                    Error Memuat Data
                </Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Pastikan server Rust berjalan di **http://127.0.0.1:8080** dan MongoDB sudah terhubung.
                </Typography>
                <Paper elevation={3} sx={{ p: 2 }}>
                    <pre style={{ textAlign: 'left', overflowX: 'auto' }}>{error}</pre>
                </Paper>
                <Button variant="contained" color="primary" onClick={() => window.location.reload()} sx={{ mt: 3 }}>
                    Coba Lagi
                </Button>
            </Box>
        );
    }


    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh', 
                textAlign: 'center', 
                p: 2, // Tambahkan padding
            }}
        >
            {/* Tombol Dark Mode/Light Mode ditempatkan di sini */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <ModeToggleButton />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                Daftar Mahasiswa
            </Typography>
            <Stack spacing={2} direction="column" sx={{ width: '90%', maxWidth: 900 }}> {/* Lebar lebih besar */}
                <Paper sx={{ height: 400, width: '100%' }}>
                    <DataGrid<StudentData>
                        rows={students} // Gunakan data dari API
                        columns={columns}
                        getRowId={(row) => row.id} // Tentukan ID unik untuk DataGrid
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10]}
                        checkboxSelection
                        disableRowSelectionOnClick // Opsional
                        sx={{ border: 0 }}
                    />
                </Paper>
                <Button variant="contained" color="primary" href="../">
                    Kembali ke Beranda
                </Button>
            </Stack>
        </Box>
    );
}