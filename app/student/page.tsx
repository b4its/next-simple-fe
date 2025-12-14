// src/app/student/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
    Button, Typography, Box, Paper, Stack, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert 
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid';
import ModeToggleButton from '../../components/ModeToggleBiutton'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// URL Dasar API Rust
const API_URL = 'http://127.0.0.1:8080/api/v1/students';

// --- Tipe Data Disesuaikan dengan API Rust ---
interface StudentData {
    id: string; 
    name: string;
    major: string;
    enrollment_year: number;
}

// Tipe untuk Input/Formulir (tidak termasuk ID)
interface StudentInput {
    name: string;
    major: string;
    enrollment_year: number;
}

const paginationModel = { page: 0, pageSize: 5 };

// 🎯 DEFINISI KOLOM DATA GRID DASAR 
const columns: GridColDef<StudentData>[] = [
    { field: 'id', headerName: 'Id', width: 220, headerAlign: 'center', align: 'left' }, 
    { field: 'name', headerName: 'Nama', width: 180, headerAlign: 'center', align: 'left' },
    { field: 'major', headerName: 'Jurusan', width: 150, headerAlign: 'center', align: 'left' },
    {
        field: 'enrollment_year',
        headerName: 'Tahun Masuk',
        type: 'number',
        width: 130,
        headerAlign: 'center',
        align: 'center',
    },
];

// --- Komponen Custom Toolbar DataGrid ---
function CustomRefreshToolbar({ onRefreshClick }: { onRefreshClick: () => void }) {
    return (
        <GridToolbarContainer sx={{ justifyContent: 'flex-end' }}>
            <Button color="inherit" startIcon={<RefreshIcon />} onClick={onRefreshClick} size="small">
                Refresh Data
            </Button>
        </GridToolbarContainer>
    );
}

// --- Komponen Halaman ---
export default function StudentPage() {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State untuk CRUD
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<StudentData | StudentInput>({
        name: '',
        major: '',
        enrollment_year: 0,
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // --- Fungsi Fetch Data (READ) ---
    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gagal mengambil data: Status ${response.status}. Detail: ${errorBody.substring(0, 100)}...`);
            }
            
            const data: StudentData[] = await response.json();
            
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                throw new Error("Format data tidak valid (bukan array).");
            }
        } catch (err) {
            console.error("Kesalahan saat mengambil data:", err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // --- Handlers Formulir ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'enrollment_year' ? parseInt(value) || 0 : value,
        }));
    };

    // --- Handler POST (CREATE) ---
    const handleCreate = async () => {
        try {
            const { name, major, enrollment_year } = formData as StudentInput; 
            if (!name || !major || enrollment_year <= 1900) {
                 setSnackbar({ open: true, message: 'Harap isi semua kolom dengan benar.', severity: 'error' });
                 return;
            }

            const body = JSON.stringify({ name, major, enrollment_year });
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSnackbar({ open: true, message: `Gagal membuat mahasiswa: ${response.status}`, severity: 'error' });
                throw new Error(`Gagal membuat mahasiswa: ${response.status} - ${errorText.substring(0, 100)}...`);
            }

            // NOTIFIKASI SUKSES CREATE
            setSnackbar({ open: true, message: 'Mahasiswa berhasil ditambahkan!', severity: 'success' });
            setIsModalOpen(false);
            fetchStudents(); 
        } catch (err) {
            console.error("Kesalahan CREATE:", err);
            // Notifikasi Error ditangani di throw Error di atas
        }
    };

    // --- Handler PUT (UPDATE) ---
    const handleUpdate = async () => {
        const studentToUpdate = formData as StudentData;
        const { id, name, major, enrollment_year } = studentToUpdate;

        try {
            const body = JSON.stringify({ name, major, enrollment_year });
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSnackbar({ open: true, message: `Gagal memperbarui: ${response.status}`, severity: 'error' });
                throw new Error(`Gagal memperbarui: ${response.status} - ${errorText.substring(0, 100)}...`);
            }

            // NOTIFIKASI SUKSES UPDATE
            setSnackbar({ open: true, message: 'Mahasiswa berhasil diperbarui!', severity: 'success' });
            setIsModalOpen(false);
            fetchStudents(); 
        } catch (err) {
            console.error("Kesalahan UPDATE:", err);
            // Notifikasi Error ditangani di throw Error di atas
        }
    };

    // --- Handler DELETE (DELETE) ---
    const handleDelete = async (id: string) => {
        if (!window.confirm(`Anda yakin ingin menghapus Mahasiswa dengan ID: ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSnackbar({ open: true, message: `Gagal menghapus: ${response.status}`, severity: 'error' });
                throw new Error(`Gagal menghapus: ${response.status} - ${errorText.substring(0, 100)}...`);
            }

            // NOTIFIKASI SUKSES DELETE
            setSnackbar({ open: true, message: 'Mahasiswa berhasil dihapus!', severity: 'success' });
            fetchStudents(); 
        } catch (err) {
            console.error("Kesalahan DELETE:", err);
            // Notifikasi Error ditangani di throw Error di atas
        }
    };
    
    // --- Setup Modal/Formulir ---
    const handleOpenCreateModal = () => {
        setFormData({ name: '', major: '', enrollment_year: 0 }); 
        setIsEditing(false); 
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (student: StudentData) => {
        setFormData(student);
        setIsEditing(true); 
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // --- Setup Kolom DataGrid (termasuk Kolom Aksi) ---
    const studentColumns: GridColDef<StudentData>[] = [
        ...columns, 
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Aksi',
            width: 100, 
            headerAlign: 'center',
            getActions: (params: GridRenderCellParams<StudentData>) => [
                <GridActionsCellItem 
                    icon={<EditIcon />} 
                    label="Edit"
                    onClick={() => handleOpenEditModal(params.row)} // Langsung buka modal edit
                    key="edit-icon"
                />,
                <GridActionsCellItem 
                    icon={<DeleteIcon />} 
                    label="Hapus"
                    onClick={() => handleDelete(params.row.id)} // Langsung panggil fungsi delete
                    color="error"
                    key="delete-icon"
                />,
            ],
        },
    ];

    // --- RENDER UTAMA ---

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Memuat Data dari API Rust...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
                <Typography color="error" variant="h5" gutterBottom>
                    Error Memuat Data
                </Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Pastikan server Rust berjalan di **http://127.0.0.1:8080**, MongoDB berjalan, dan CORS diaktifkan.
                </Typography>
                <Paper elevation={3} sx={{ p: 2, maxWidth: 600 }}>
                    <pre style={{ textAlign: 'left', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{error}</pre>
                </Paper>
                <Button variant="contained" color="primary" onClick={fetchStudents} sx={{ mt: 3 }}>
                    Coba Refresh Data
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '100vh', 
                    textAlign: 'center', 
                    p: 2,
                }}
            >
                {/* Tombol Dark Mode/Light Mode */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                    <ModeToggleButton />
                </Box>

                <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                    Manajemen Data Mahasiswa
                </Typography>
                <Stack spacing={2} direction="column" sx={{ width: '90%', maxWidth: 1000 }}>
                    <Paper sx={{ height: 500, width: '100%' }}>
                        <DataGrid<StudentData>
                            rows={students} 
                            columns={studentColumns} 
                            getRowId={(row) => row.id} 
                            initialState={{ pagination: { paginationModel } }}
                            pageSizeOptions={[5, 10]}
                            slots={{
                                // Hanya Tombol Refresh di Toolbar
                                toolbar: () => <CustomRefreshToolbar onRefreshClick={fetchStudents} />,
                            }}
                            sx={{ border: 0 }}
                            disableRowSelectionOnClick
                        />
                    </Paper>

                    {/* Tombol CREATE dan KEMBALI di Stack yang sama (di bawah tabel) */}
                    <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ width: '100%' }}>
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            startIcon={<ArrowBackIcon />}
                            href="../"
                            sx={{ flexGrow: 1, maxWidth: '48%' }}
                        >
                            Kembali ke Beranda
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateModal} // Membuka modal CREATE
                            sx={{ flexGrow: 1, maxWidth: '48%' }} 
                        >
                            Tambah Data Mahasiswa Baru
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* --- Dialog (Modal) untuk CREATE/UPDATE --- */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>{isEditing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Nama"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            name="major"
                            label="Jurusan"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.major}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            name="enrollment_year"
                            label="Tahun Masuk"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.enrollment_year || ''}
                            onChange={handleInputChange}
                            inputProps={{ min: 1900, max: new Date().getFullYear() }}
                        />
                        {isEditing && (
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                                ID: {(formData as StudentData).id}
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">Batal</Button>
                    <Button 
                        onClick={isEditing ? handleUpdate : handleCreate} 
                        color="primary" 
                        variant="contained"
                    >
                        {isEditing ? 'Simpan Perubahan' : 'Buat'} 
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- Snackbar untuk Notifikasi --- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}