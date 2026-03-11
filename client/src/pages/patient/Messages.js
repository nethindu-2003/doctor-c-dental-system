import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, 
  Avatar, TextField, IconButton, Divider, Stack, CircularProgress, Menu, MenuItem
} from '@mui/material';
import { 
  Send, Search, MoreVert, EmojiEmotions, Edit, Delete, Close, Circle 
} from '@mui/icons-material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';
import axios from '../../api/axios';
import { chatApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext'; 
import dayjs from 'dayjs';

const PatientMessages = () => {
  const { user } = useAuth();
  const patientId = user?.id || 1;

  const [dentists, setDentists] = useState([]);
  const [selectedDentistId, setSelectedDentistId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Dentists
  useEffect(() => {
    axios.get('/dentists')
      .then(res => {
        setDentists(res.data);
        if (res.data.length > 0) setSelectedDentistId(res.data[0].dentistId || res.data[0].id);
      })
      .catch(err => console.error("Failed to load dentists", err));
  }, []);

  // 2. Load History & Connect WebSocket
  useEffect(() => {
    if (!selectedDentistId) return;

    setLoadingHistory(true);
    chatApi.get(`/api/chat/history?patientId=${patientId}&dentistId=${selectedDentistId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Failed to fetch history", err))
      .finally(() => setLoadingHistory(false));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws-chat'),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        const room = `/topic/chat/${patientId}/${selectedDentistId}`;
        
        client.subscribe(room, (message) => {
          const received = JSON.parse(message.body);
          
          setMessages((prev) => {
            // Handle Spring Boot JSON boolean naming
            const isMsgDeleted = received.isDeleted === true || received.deleted === true;
            const isMsgEdited = received.isEdited === true || received.edited === true;

            // Vanish message if deleted
            if (isMsgDeleted) {
              return prev.filter(m => m.messageId !== received.messageId);
            }
            // Update text if edited
            if (isMsgEdited) {
              return prev.map(m => m.messageId === received.messageId ? received : m);
            }
            // Add new message
            const exists = prev.find(m => m.messageId === received.messageId);
            if (!exists) {
              return [...prev, received];
            }
            return prev;
          });
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (err) => console.error('STOMP Error:', err)
    });

    client.activate();
    stompClientRef.current = client;

    return () => { if (client) client.deactivate(); };
  }, [selectedDentistId, patientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !stompClientRef.current?.connected) return;

    if (editingMessage) {
      chatApi.put(`/api/chat/edit/${editingMessage.messageId}`, newMessage, {
        headers: { 'Content-Type': 'text/plain' }
      }).then(() => {
        setNewMessage('');
        setEditingMessage(null);
      }).catch(err => console.error("Edit failed", err));
    } else {
      const payload = {
        patientId: patientId,
        dentistId: selectedDentistId,
        senderType: 'PATIENT',
        receiverType: 'DENTIST',
        content: newMessage
      };
      stompClientRef.current.publish({ destination: '/app/sendMessage', body: JSON.stringify(payload) });
      setNewMessage('');
    }
    setShowEmojiPicker(false);
  };

  const handleDelete = (msgId) => {
    chatApi.delete(`/api/chat/delete/${msgId}`)
      .catch(err => console.error("Delete failed", err));
    setAnchorEl(null);
  };

  const activeDentist = dentists.find(d => (d.dentistId || d.id) === selectedDentistId);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)' }}> 
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C" sx={{ mb: 3 }}>Secure Messages</Typography>

      <Paper elevation={0} sx={{ height: '100%', borderRadius: 4, border: '1px solid #e0e0e0', display: 'flex' }}>
        
        {/* LEFT SIDE: DENTISTS */}
        <Box sx={{ width: 320, borderRight: '1px solid #e0e0e0', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', bgcolor: '#FAFAFA' }}>
          <Box sx={{ p: 2 }}>
            <TextField fullWidth size="small" placeholder="Search clinic staff..." InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }} />
          </Box>
          <Divider />
          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {dentists.map((dentist, index) => {
              const dId = dentist.dentistId || dentist.id;
              return (
                <Box key={`dentist-${dId || index}`}>
                  <ListItem 
                    selected={selectedDentistId === dId} 
                    onClick={() => setSelectedDentistId(dId)} 
                    sx={{ 
                      borderLeft: selectedDentistId === dId ? '4px solid #0E4C5C' : '4px solid transparent', 
                      '&:hover': { cursor: 'pointer', bgcolor: '#f5f5f5' } 
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#0E4C5C' }}>{dentist.name ? dentist.name.charAt(0) : 'D'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`Dr. ${dentist.name || 'Unknown'}`} secondary={dentist.specialization || 'Dentist'} />
                  </ListItem>
                  <Divider component="li" />
                </Box>
              );
            })}
          </List>
        </Box>

        {/* RIGHT SIDE: CHAT */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white', position: 'relative' }}>
          {activeDentist ? (
            <>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0E4C5C', mr: 2 }}>{activeDentist.name ? activeDentist.name.charAt(0) : 'D'}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">Dr. {activeDentist.name || 'Unknown'}</Typography>
                    <Typography variant="caption" color="text.secondary">{activeDentist.specialization || 'Dentist'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Circle sx={{ fontSize: 12, color: isConnected ? '#4CAF50' : '#FF9800' }} />
                  <Typography variant="caption" color="text.secondary">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </Typography>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#F4F7F6' }}>
                {loadingHistory ? <Box textAlign="center"><CircularProgress /></Box> : (
                  messages.map((msg, index) => {
                    // Filter logic handled in WebSocket subscriber, so map normally here
                    const isPatient = msg.senderType === 'PATIENT';
                    return (
                      <Box key={`msg-${msg.messageId || index}`} sx={{ display: 'flex', justifyContent: isPatient ? 'flex-end' : 'flex-start', mb: 2 }}>
                        <Paper elevation={0} sx={{ 
                          p: 1.5, px: 2, maxWidth: '70%', borderRadius: 3, position: 'relative',
                          borderTopRightRadius: isPatient ? 0 : 12, borderTopLeftRadius: isPatient ? 12 : 0,
                          bgcolor: isPatient ? '#0E4C5C' : 'white', color: isPatient ? 'white' : 'text.primary',
                        }}>
                          <Typography variant="body1">{msg.content}</Typography>
                          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 0.5 }}>
                            {msg.isEdited && <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem' }}>(edited)</Typography>}
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>{msg.sentAt ? dayjs(msg.sentAt).format('h:mm A') : 'Now'}</Typography>
                          </Stack>
                          {isPatient && (
                            <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedMsgForMenu(msg); }} sx={{ position: 'absolute', top: 0, right: -30, color: 'text.secondary' }}>
                              <MoreVert fontSize="small" />
                            </IconButton>
                          )}
                        </Paper>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Context Menu */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setEditingMessage(selectedMsgForMenu); setNewMessage(selectedMsgForMenu.content); setAnchorEl(null); }}><Edit fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
                <MenuItem onClick={() => handleDelete(selectedMsgForMenu.messageId)} sx={{ color: 'error.main' }}><Delete fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
              </Menu>
              
              {/* Emoji Picker */}
              {showEmojiPicker && <Box sx={{ position: 'absolute', bottom: 80, right: 20, zIndex: 10 }}><EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} /></Box>}

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
                {editingMessage && (
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, p: 1, bgcolor: '#FFF9C4', borderRadius: 1 }}>
                    <Typography variant="caption" color="black">Editing message...</Typography>
                    <IconButton size="small" onClick={() => { setEditingMessage(null); setNewMessage(''); }}><Close fontSize="small" /></IconButton>
                  </Stack>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}><EmojiEmotions color="action" /></IconButton>
                  <TextField 
                    fullWidth size="small" variant="outlined" 
                    placeholder={isConnected ? "Type a message..." : "Connecting to server..."}
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && isConnected && handleSend()}
                    disabled={!isConnected}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: '#f9f9f9' } }}
                  />
                  <IconButton 
                    onClick={handleSend} 
                    disabled={!isConnected}
                    sx={{ bgcolor: isConnected ? '#0E4C5C' : '#ccc', color: isConnected ? 'white' : '#999', '&:hover': { bgcolor: isConnected ? '#083642' : '#ccc' } }}
                  >
                    <Send />
                  </IconButton>
                </Stack>
              </Box>
            </>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Select a doctor</Typography></Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default PatientMessages;