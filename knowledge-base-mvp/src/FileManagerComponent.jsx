import React, { useState, useEffect } from 'react';
import axiosInstance from "./axios";
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function FileManagerComponent() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);   // loading state for file upload
    const [loadingFiles, setLoadingFiles] = useState(false); // loading state for fetching file list

    // Handle file selection for upload
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    // Upload selected files
    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('data', file));

        try {
            await axiosInstance.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSelectedFiles([]);
            fetchFiles(); // Refresh the file list after uploading
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    // Fetch list of uploaded files
    const fetchFiles = async () => {
        setLoadingFiles(true);
        try {
            const response = await axiosInstance.get('/listFiles');
            setUploadedFiles(response.data || null);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

    // Delete a file from Google Drive
    const handleDelete = async (fileId) => {
        try {
            await axiosInstance.delete('/deleteFile', {
                data: { fileId },
            });
            fetchFiles();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Fetch files on component mount
    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Google Drive File Manager
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* File Upload Section */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                <Typography variant="h6" gutterBottom>
                    Upload Files
                </Typography>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ marginBottom: '20px' }}
                    disabled={uploading}
                />
                <List sx={{ width: '100%', mb: 2 }}>
                    {selectedFiles.map((file, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={file.name} />
                        </ListItem>
                    ))}
                </List>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload Selected Files'}
                </Button>

                {/* Show spinner while uploading */}
                {uploading && <CircularProgress size={24} sx={{ mt: 2 }} />}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* File List Section */}
            <Box>
                <Typography variant="h6" align="center" gutterBottom>
                    Uploaded Files
                </Typography>
                {loadingFiles ? (
                    // Show spinner while fetching file list
                    <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : uploadedFiles.length === 0 ? (
                    <Typography align="center">No files uploaded yet.</Typography>
                ) : (
                    <List>
                        {uploadedFiles.map((file) => (
                            <ListItem
                                key={file.id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        color="error"
                                        onClick={() => handleDelete(file.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={file.name}
                                    secondary={`ID: ${file.id}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
}

export default FileManagerComponent;
