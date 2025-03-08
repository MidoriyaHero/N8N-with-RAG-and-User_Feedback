import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatComponent from './Chat';
import FileManagerComponent from './FileManagerComponent';

function App() {
  const [openSidebar, setOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top AppBar with toggle button */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            RAG App V0.0.3 - IF U GOT ERROR, PLEASE REFRESH THE PAGE AND USE ANOTHER SESSIONID !!!
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer for File Manager */}
      <Drawer anchor="left" open={openSidebar} onClose={toggleSidebar}>
        <Box sx={{ width: 300, p: 2 }}>
          <FileManagerComponent />
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        <ChatComponent />
      </Box>
    </Box>
  );
}

export default App;
