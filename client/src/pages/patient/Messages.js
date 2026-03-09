import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, 
  Avatar, TextField, IconButton, Divider, Stack, CircularProgress, Menu, MenuItem
} from '@mui/material';
import { 
  Send, Search, MoreVert, Circle, EmojiEmotions, Edit, Delete, Close 
} from '@mui/icons-material';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext'; 
import dayjs from 'dayjs';

const PatientMessages = () => {
  const { user } = useAuth();
  const patientId = user?.id || 1;

  // STRICT RULE: Only fetch Dentists. No patients allowed here.
  const [dentists, setDentists] = useState([]);
  const [selectedDentistId, setSelectedDentistId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Chat Actions
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get('/auth/dentists')
      .then(res => {
        setDentists(res.data);
        if (res.data.length > 0) setSelectedDentistId(res.data[0].id);
      })
      .catch(err => console.error("Failed to load dentists", err));
  }, []);

  useEffect(() => {
    if (!selectedDentistId) return;

    setLoadingHistory(true);
    axios.get(`/chat/history/${patientId}/${selectedDentistId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Failed to fetch history", err))
      .finally(() => setLoadingHistory(false));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      onConnect: () => {
        setIsConnected(true);
        const room = `/topic/messages/${patientId}/${selectedDentistId}`;
        client.subscribe(room, (message) => {
          const received = JSON.parse(message.body);
          setMessages((prev) => {
            if (received.action === 'DELETE') {
              return prev.map(m => m.messageId === received.messageId ? { ...m, content: '🚫 This message was deleted', isDeleted: true } : m);
            }
            if (received.action === 'EDIT') {
              return prev.map(m => m.messageId === received.messageId ? { ...m, content: received.content, isEdited: true } : m);
            }
            if (!prev.find(m => m.messageId === received.messageId)) return [...prev, received];
            return prev;
          });
        });
      },
      onDisconnect: () => setIsConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => { if (client) client.deactivate(); };
  }, [selectedDentistId, patientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendOrEdit = () => {
    if (!newMessage.trim() || !stompClientRef.current?.connected) return;

    const payload = {
      messageId: editingMessage ? editingMessage.messageId : null,
      patientId: patientId,
      dentistId: selectedDentistId,
      senderType: 'PATIENT',
      receiverType: 'DENTIST',
      content: newMessage,
      action: editingMessage ? 'EDIT' : 'SEND'
    };

    stompClientRef.current.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) });
    setNewMessage(''); setEditingMessage(null); setShowEmojiPicker(false);
  };

  const handleDelete = (msgId) => {
    const payload = { messageId: msgId, patientId: patientId, dentistId: selectedDentistId, action: 'DELETE' };
    stompClientRef.current.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) });
    setAnchorEl(null);
  };

  const activeDentist = dentists.find(d => d.id === selectedDentistId);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)' }}> 
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="#0E4C5C" sx={{ mb: 3 }}>Secure Messages</Typography>

      <Paper elevation={0} sx={{ height: '100%', borderRadius: 4, border: '1px solid #e0e0e0', display: 'flex' }}>
        
        {/* LEFT SIDE: DENTISTS ONLY */}
        <Box sx={{ width: 320, borderRight: '1px solid #e0e0e0', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', bgcolor: '#FAFAFA' }}>
          <Box sx={{ p: 2 }}><TextField fullWidth size="small" placeholder="Search clinic staff..." InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }} /></Box>
          <Divider />
          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {dentists.map((dentist) => (
              <ListItem button key={dentist.id} selected={selectedDentistId === dentist.id} onClick={() => setSelectedDentistId(dentist.id)} sx={{ borderLeft: selectedDentistId === dentist.id ? '4px solid #0E4C5C' : '4px solid transparent' }}>
                <ListItemAvatar><Avatar sx={{ bgcolor: '#0E4C5C' }}>{dentist.name.charAt(0)}</Avatar></ListItemAvatar>
                <ListItemText primary={`Dr. ${dentist.name}`} secondary={dentist.specialization} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* RIGHT SIDE: CHAT */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white', position: 'relative' }}>
          {activeDentist ? (
            <>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#0E4C5C', mr: 2 }}>{activeDentist.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">Dr. {activeDentist.name}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                     <Circle sx={{ fontSize: 10, color: isConnected ? '#4CAF50' : '#9E9E9E' }} />
                     <Typography variant="caption" color="text.secondary">{isConnected ? 'Online' : 'Offline'} • {activeDentist.specialization}</Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#F4F7F6' }}>
                {loadingHistory ? <Box textAlign="center"><CircularProgress /></Box> : (
                  messages.map((msg, index) => {
                    const isPatient = msg.senderType === 'PATIENT';
                    return (
                      <Box key={index} sx={{ display: 'flex', justifyContent: isPatient ? 'flex-end' : 'flex-start', mb: 2 }}>
                        <Paper elevation={0} sx={{ 
                          p: 1.5, px: 2, maxWidth: '70%', borderRadius: 3, position: 'relative',
                          borderTopRightRadius: isPatient ? 0 : 12, borderTopLeftRadius: isPatient ? 12 : 0,
                          bgcolor: isPatient ? '#0E4C5C' : 'white', color: isPatient ? 'white' : 'text.primary',
                        }}>
                          <Typography variant="body1" sx={{ fontStyle: msg.isDeleted ? 'italic' : 'normal', opacity: msg.isDeleted ? 0.7 : 1 }}>
                            {msg.content}
                          </Typography>
                          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 0.5 }}>
                            {msg.isEdited && !msg.isDeleted && <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.65rem' }}>(edited)</Typography>}
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>{msg.sentAt ? dayjs(msg.sentAt).format('h:mm A') : 'Now'}</Typography>
                          </Stack>
                          {isPatient && !msg.isDeleted && (
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

              {/* Context Menu & Emoji */}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setEditingMessage(selectedMsgForMenu); setNewMessage(selectedMsgForMenu.content); setAnchorEl(null); }}><Edit fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
                <MenuItem onClick={() => handleDelete(selectedMsgForMenu.messageId)} sx={{ color: 'error.main' }}><Delete fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
              </Menu>
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
                    fullWidth size="small" variant="outlined" placeholder="Type a message..."
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendOrEdit()}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: '#f9f9f9' } }}
                  />
                  <IconButton onClick={handleSendOrEdit} sx={{ bgcolor: '#0E4C5C', color: 'white', '&:hover': { bgcolor: '#083642' } }}><Send /></IconButton>
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