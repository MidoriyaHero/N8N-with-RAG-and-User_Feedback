import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from "./axios";
import {
    Box,
    Button,
    TextField,
    Paper,
    Typography,
    List,
    ListItem,
    CircularProgress,
    IconButton
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

function Chat() {
    const [sessionID, setSessionID] = useState('');
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendQuery = async () => {
        // Check if sessionID is provided
        if (!query.trim() || !sessionID.trim()) {
            alert('Please enter a session ID.');
            return;
        }

        // Add user message to conversation
        setMessages(prev => [...prev, { sender: 'You', text: query }]);
        setLoading(true);

        try {
            // Post the chat message to your backend with the custom session ID
            const response = await axiosInstance.post('/chat', {
                message: query,
                sessionid: sessionID,
            });
            console.log(response.data);

            // Determine if response.data is an array or object
            let data;
            if (Array.isArray(response.data)) {
                data = response.data[0]; // Take the first element if it's an array
            } else {
                data = response.data; // Use the object directly if it's not an array
            }

            // Extract the bot response and optional fileid with safe defaults
            const replyText = data?.output || 'No reply received.';
            const replyId = data?.id || null;
            const replyFileId = data?.fileid || null;

            console.log("bot reply:", { message: replyText, id: replyId, fileid: replyFileId });

            // Update the messages state with the bot's reply
            setMessages(prev => [
                ...prev,
                { sender: 'Bot', text: replyText, id: replyId, fileid: replyFileId }
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                { sender: 'Bot', text: 'Error occurred while sending message.' }
            ]);
        } finally {
            setQuery('');
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuery();
        }
    };

    const handleLike = (index) => {
        console.log(`User liked message: "${messages[index].text}"`);
    };

    const handleDislike = async (index) => {
        try {
            const dislikedMessage = `User disliked message: "${messages[index].text}"`;
            const id = messages[index].id || null;
            const fileid = messages[index].fileid || null;
            console.log("Dislike Payload:", { message: dislikedMessage, id: id, fileid: fileid, sessionid: sessionID });
            // Prepare payload with the disliked message, id, and fileid.
            const payload = {
                message: dislikedMessage,
                id: id,
                fileid: fileid,
                sessionid: sessionID,
            };

            const response = await axiosInstance.post('/dislike', payload);
            console.log('Dislike response:', response.data);

            let responseData;
            if (Array.isArray(response.data)) {
                responseData = response.data[0] || {};
            } else {
                responseData = response.data || {};
            }

            // Correctly extract all fields
            const newReply = responseData.output || 'Feedback received.';
            const idNew = responseData.id || null;
            const fileidNew = responseData.fileid || null;

            console.log("Adding new message with:", { text: newReply, id: idNew, fileid: fileidNew });

            // Make sure to include all fields in the new message
            setMessages(prev => [
                ...prev,
                {
                    sender: 'Bot',
                    text: newReply,
                    id: idNew,
                    fileid: fileidNew
                }
            ]);
        } catch (error) {
            console.error('Dislike error:', error);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>
                Chat with Bot
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Session ID:</Typography>
                <TextField
                    value={sessionID}
                    onChange={(e) => setSessionID(e.target.value)}
                    placeholder="Enter session ID..."
                    size="small"
                    fullWidth
                    required
                    error={!sessionID.trim()}
                    helperText={!sessionID.trim() ? "Session ID is required." : ""}
                />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                <List>
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'You';
                        return (
                            <ListItem
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: '60%',
                                        backgroundColor: isUser ? 'primary.light' : 'grey.200',
                                        color: 'black',
                                        p: 2,
                                        borderRadius: 2,
                                        mb: 1,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {msg.sender}
                                    </Typography>
                                    <Typography variant="body2">
                                        {msg.text}
                                    </Typography>
                                    {!isUser && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <IconButton onClick={() => handleLike(index)} size="small" color="primary">
                                                <ThumbUpIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => handleDislike(index)} size="small" color="error">
                                                <ThumbDownIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            </ListItem>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <Button variant="contained" onClick={sendQuery} sx={{ ml: 1 }} disabled={loading}>
                    Send
                </Button>
                {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
        </Paper>
    );
}

export default Chat;
