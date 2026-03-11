import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, List, ListItemButton, ListItemAvatar, 
  ListItemText, Avatar, TextField, IconButton, Divider, Stack, Grid, CircularProgress, Menu, MenuItem
} from '@mui/material';
import { 
  Search, Send, MoreVert, Circle, EmojiEmotions, Edit, Delete, Close
} from '@mui/icons-material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';
import { chatApi } from '../../api/axios';
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
  const [isConnected, setIsConnected] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Patients assigned to this dentist
  useEffect(() => {
    axios.get('/dentist/patients') 
      .then(res => {
        setPatients(res.data);
        if (res.data.length > 0) setSelectedPatientId(res.data[0].patientId || res.data[0].id);
      })
      .catch(err => console.error("Failed to load patients", err));
  }, []);

  // 2. Load History & Connect WebSocket
  useEffect(() => {
    if (!selectedPatientId) return;

    setLoadingHistory(true);
    chatApi.get(`/api/chat/history?patientId=${selectedPatientId}&dentistId=${dentistId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Failed to fetch history", err))
      .finally(() => setLoadingHistory(false));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws-chat'),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        const room = `/topic/chat/${selectedPatientId}/${dentistId}`;
        
        client.subscribe(room, (message) => {
          const received = JSON.parse(message.body);
          
          setMessages((prev) => {
            const isMsgDeleted = received.isDeleted === true || received.deleted === true;
            const isMsgEdited = received.isEdited === true || received.edited === true;

            if (isMsgDeleted) {
              return prev.filter(m => m.messageId !== received.messageId);
            }
            if (isMsgEdited) {
              return prev.map(m => m.messageId === received.messageId ? received : m);
            }
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
  }, [selectedPatientId, dentistId]);

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
        patientId: selectedPatientId,
        dentistId: dentistId,
        senderType: 'DENTIST',
        receiverType: 'PATIENT',
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

  const activePatient = patients.find(p => (p.patientId || p.id) === selectedPatientId);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)' }}> 
      <Grid container sx={{ height: '100%' }} spacing={2}>
        
        {/* --- LEFT SIDE: PATIENTS --- */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #E0E4E8' }}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0E4C5C' }}>Conversations</Typography>
              <TextField 
                fullWidth 
                placeholder="Search patients..." 
                size="small" 
                InputProps={{ startAdornment: <Search sx={{ mr:1, color:'action.active'}} /> }} 
              />
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
              {patients.map((patient, index) => {
                const pId = patient.patientId || patient.id;
                return (
                  <ListItemButton 
                    key={`patient-${pId || index}`} 
                    selected={selectedPatientId === pId}
                    onClick={() => { setSelectedPatientId(pId); setEditingMessage(null); }}
                    sx={{ borderLeft: selectedPatientId === pId ? '4px solid #0E4C5C' : '4px solid transparent' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#0E4C5C' }}>{patient.name ? patient.name.charAt(0) : 'P'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={patient.name || 'Unknown Patient'} 
                      secondary={`Patient ID: ${pId}`} 
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* --- RIGHT SIDE: CHAT WINDOW --- */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          {activePatient ? (
            <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #E0E4E8', position: 'relative' }}>
              
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: '#0E4C5C' }}>{activePatient.name ? activePatient.name.charAt(0) : 'P'}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{activePatient.name || 'Unknown Patient'}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                       <Circle sx={{ fontSize: 10, color: isConnected ? '#4CAF50' : '#FF9800' }} />
                       <Typography variant="caption" color="text.secondary">
                         {isConnected ? 'Connected' : 'Connecting...'} • ID: {activePatient.patientId || activePatient.id}
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
                      <Box key={`msg-${msg.messageId || index}`} sx={{ display: 'flex', justifyContent: isDentist ? 'flex-end' : 'flex-start', mb: 2 }}>
                        <Paper elevation={0} sx={{ 
                          p: 1.5, px: 2, maxWidth: '70%', borderRadius: 3,
                          borderTopRightRadius: isDentist ? 0 : 12, borderTopLeftRadius: isDentist ? 12 : 0,
                          bgcolor: isDentist ? '#0E4C5C' : 'white', color: isDentist ? 'white' : 'text.primary',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative'
                        }}>
                          <Typography variant="body1">{msg.content}</Typography>
                          
                          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                            {msg.isEdited && <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem' }}>(edited)</Typography>}
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>{msg.sentAt ? dayjs(msg.sentAt).format('h:mm A') : 'Now'}</Typography>
                          </Stack>

                          {/* 3-Dot Menu for Own Messages */}
                          {isDentist && (
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
                    <Typography variant="caption" color="black">Editing message...</Typography>
                    <IconButton size="small" onClick={() => { setEditingMessage(null); setNewMessage(''); }}><Close fontSize="small" /></IconButton>
                  </Stack>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}><EmojiEmotions color="action" /></IconButton>
                  <TextField 
                    fullWidth 
                    placeholder={isConnected ? "Type a message..." : "Connecting to server..."} 
                    variant="outlined" 
                    size="small"
                    disabled={!isConnected}
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && isConnected && handleSend()}
                    sx={{ bgcolor: '#F8FAFC', borderRadius: 1 }}
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