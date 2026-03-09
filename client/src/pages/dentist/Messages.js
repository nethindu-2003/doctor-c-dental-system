import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, List, ListItemButton, ListItemAvatar, 
  ListItemText, Avatar, TextField, InputAdornment, Divider, IconButton, 
  Stack, Grid, CircularProgress, Menu, MenuItem
} from '@mui/material';
import { 
  Search, Send, MoreVert, Phone, Videocam, Circle, EmojiEmotions, Edit, Delete, Close
} from '@mui/icons-material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const DentistMessages = () => {
  const { user } = useAuth();
  const dentistId = user?.id || 1;

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Online Status

  // Chat Input & Actions
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  // Message Menu Anchor
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Patients
  useEffect(() => {
    axios.get('/dentist/patients')
      .then(res => {
        setPatients(res.data);
        if (res.data.length > 0) setSelectedPatientId(res.data[0].patientId);
      })
      .catch(err => console.error("Failed to load patients", err));
  }, []);

  // 2. WebSocket & History
  useEffect(() => {
    if (!selectedPatientId) return;

    setLoadingHistory(true);
    axios.get(`/chat/history/${selectedPatientId}/${dentistId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Failed to fetch history", err))
      .finally(() => setLoadingHistory(false));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      onConnect: () => {
        setIsConnected(true);
        const room = `/topic/messages/${selectedPatientId}/${dentistId}`;
        client.subscribe(room, (message) => {
          const received = JSON.parse(message.body);
          
          // Handle SEND, EDIT, and DELETE dynamically
          setMessages((prev) => {
            if (received.action === 'DELETE') {
              return prev.map(m => m.messageId === received.messageId ? { ...m, content: '🚫 This message was deleted', isDeleted: true } : m);
            }
            if (received.action === 'EDIT') {
              return prev.map(m => m.messageId === received.messageId ? { ...m, content: received.content, isEdited: true } : m);
            }
            // If it's a new message
            if (!prev.find(m => m.messageId === received.messageId)) {
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
  }, [selectedPatientId, dentistId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Handlers
  const handleSendOrEdit = () => {
    if (!newMessage.trim() || !stompClientRef.current?.connected) return;

    const payload = {
      messageId: editingMessage ? editingMessage.messageId : null,
      patientId: selectedPatientId,
      dentistId: dentistId,
      senderType: 'DENTIST',
      receiverType: 'PATIENT',
      content: newMessage,
      action: editingMessage ? 'EDIT' : 'SEND'
    };

    stompClientRef.current.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) });

    setNewMessage('');
    setEditingMessage(null);
    setShowEmojiPicker(false);
  };

  const handleDelete = (msgId) => {
    const payload = { messageId: msgId, patientId: selectedPatientId, dentistId: dentistId, action: 'DELETE' };
    stompClientRef.current.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) });
    setAnchorEl(null);
  };

  const activePatient = patients.find(p => p.patientId === selectedPatientId);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)' }}> 
      <Grid container sx={{ height: '100%' }} spacing={2}>
        
        {/* --- LEFT SIDEBAR --- */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #E0E4E8' }}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0E4C5C' }}>Conversations</Typography>
              <TextField fullWidth placeholder="Search patients..." size="small" InputProps={{ startAdornment: <Search sx={{ mr:1, color:'action.active'}} /> }} />
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
              {patients.map((patient) => (
                <ListItemButton 
                  key={patient.patientId} selected={selectedPatientId === patient.patientId}
                  onClick={() => { setSelectedPatientId(patient.patientId); setEditingMessage(null); }}
                  sx={{ borderLeft: selectedPatientId === patient.patientId ? '4px solid #0E4C5C' : '4px solid transparent' }}
                >
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#0E4C5C' }}>{patient.name.charAt(0)}</Avatar></ListItemAvatar>
                  <ListItemText primary={patient.name} secondary={patient.currentTreatment} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* --- RIGHT SIDE: CHAT WINDOW --- */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          {activePatient ? (
            <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #E0E4E8', position: 'relative' }}>
              
              {/* Header (Online Status Added) */}
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: '#0E4C5C' }}>{activePatient.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{activePatient.name}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                       <Circle sx={{ fontSize: 10, color: isConnected ? '#4CAF50' : '#9E9E9E' }} />
                       <Typography variant="caption" color="text.secondary">
                         {isConnected ? 'Online (System Connected)' : 'Offline'} • {activePatient.currentTreatment}
                       </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Messages Area */}
              <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#F9FAFB' }}>
                {loadingHistory ? <Box textAlign="center" mt={5}><CircularProgress /></Box> : (
                  messages.map((msg, index) => {
                    const isDentist = msg.senderType === 'DENTIST';
                    return (
                      <Box key={index} sx={{ display: 'flex', justifyContent: isDentist ? 'flex-end' : 'flex-start', mb: 2 }}>
                        <Paper elevation={0} sx={{ 
                          p: 1.5, px: 2, maxWidth: '70%', borderRadius: 3,
                          borderTopRightRadius: isDentist ? 0 : 12, borderTopLeftRadius: isDentist ? 12 : 0,
                          bgcolor: isDentist ? '#0E4C5C' : 'white', color: isDentist ? 'white' : 'text.primary',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative'
                        }}>
                          <Typography variant="body1" sx={{ fontStyle: msg.isDeleted ? 'italic' : 'normal', opacity: msg.isDeleted ? 0.7 : 1 }}>
                            {msg.content}
                          </Typography>
                          
                          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                            {msg.isEdited && !msg.isDeleted && <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem' }}>(edited)</Typography>}
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>{msg.sentAt ? dayjs(msg.sentAt).format('h:mm A') : 'Now'}</Typography>
                          </Stack>

                          {/* 3-Dot Menu for Own Messages */}
                          {isDentist && !msg.isDeleted && (
                            <IconButton 
                              size="small" 
                              onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedMsgForMenu(msg); }}
                              sx={{ position: 'absolute', top: 0, right: -30, color: 'text.secondary' }}
                            >
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

              {/* Message Context Menu */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setEditingMessage(selectedMsgForMenu); setNewMessage(selectedMsgForMenu.content); setAnchorEl(null); }}>
                  <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedMsgForMenu.messageId)} sx={{ color: 'error.main' }}>
                  <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <Box sx={{ position: 'absolute', bottom: 80, right: 20, zIndex: 10 }}>
                  <EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} />
                </Box>
              )}

              {/* Input Area */}
              <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                {editingMessage && (
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, p: 1, bgcolor: '#FFF9C4', borderRadius: 1 }}>
                    <Typography variant="caption">Editing message...</Typography>
                    <IconButton size="small" onClick={() => { setEditingMessage(null); setNewMessage(''); }}><Close fontSize="small" /></IconButton>
                  </Stack>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}><EmojiEmotions color="action" /></IconButton>
                  <TextField 
                    fullWidth placeholder="Type a message..." variant="outlined" size="small"
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendOrEdit()}
                    sx={{ bgcolor: '#F8FAFC', borderRadius: 1 }}
                  />
                  <IconButton onClick={handleSendOrEdit} sx={{ bgcolor: '#0E4C5C', color: 'white', '&:hover': { bgcolor: '#083642' } }}>
                    <Send />
                  </IconButton>
                </Stack>
              </Box>

            </Paper>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Select a patient</Typography></Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
export default DentistMessages;