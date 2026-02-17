import React, { useState } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemButton, ListItemAvatar, 
  ListItemText, Avatar, TextField, InputAdornment, Divider, IconButton, 
  Stack, Grid, Badge 
} from '@mui/material';
import { 
  Search, Send, MoreVert, Phone, Videocam, Circle 
} from '@mui/icons-material';

// --- MOCK DATA: Conversations [cite: 382-392] ---
const initialConversations = [
  { 
    id: 1, 
    name: 'Emily Carter', 
    treatment: 'Braces', 
    lastMsg: "Tuesday afternoon would be great.", 
    time: '10:30 AM', 
    unread: 2,
    messages: [ // Chat History 
      { id: 1, sender: 'patient', text: "Hi Dr. Smith, I'm having a toothache on the left side...", time: '10:00 AM' },
      { id: 2, sender: 'patient', text: "It gets worse when I eat or drink something cold.", time: '10:01 AM' },
      { id: 3, sender: 'dentist', text: "Hi Emily, sorry to hear that. Are you available for a checkup?", time: '10:05 AM' },
      { id: 4, sender: 'patient', text: "Yes, I'm available. What days do you have openings?", time: '10:10 AM' },
      { id: 5, sender: 'patient', text: "Tuesday afternoon would be great.", time: '10:30 AM' },
    ]
  },
  { 
    id: 2, 
    name: 'David Lee', 
    treatment: 'Checkup', 
    lastMsg: "I'm available for a checkup next week.", 
    time: 'Yesterday', 
    unread: 0,
    messages: [
      { id: 1, sender: 'patient', text: "I'm available for a checkup next week.", time: '4:00 PM' }
    ]
  },
  { 
    id: 3, 
    name: 'Sarah Johnson', 
    treatment: 'Whitening', 
    lastMsg: "Your appointment is confirmed.", 
    time: 'Yesterday', 
    unread: 0,
    messages: [] 
  }
];

const Messages = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedChatId, setSelectedChatId] = useState(1); // Default select first
  const [newMessage, setNewMessage] = useState('');

  // Get Active Chat Object
  const activeChat = conversations.find(c => c.id === selectedChatId);

  // Handle Sending Message
  const handleSend = () => {
    if (!newMessage.trim()) return;

    const updatedChats = conversations.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, { id: Date.now(), sender: 'dentist', text: newMessage, time: 'Now' }],
          lastMsg: newMessage,
          time: 'Now'
        };
      }
      return chat;
    });

    setConversations(updatedChats);
    setNewMessage('');
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)' }}> {/* Fixed height for full screen feel */}
      <Grid container sx={{ height: '100%' }} spacing={2}>
        
        {/* --- LEFT SIDEBAR: CONVERSATION LIST [cite: 382-392] --- */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
            
            {/* Header & Search [cite: 381] */}
            <Box sx={{ p: 2, bgcolor: '#F4F7F6' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#0E4C5C' }}>Messages</Typography>
              <TextField
                fullWidth
                placeholder="Search patients..."
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </Box>
            <Divider />

            {/* List */}
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
              {conversations.map((chat) => (
                <ListItemButton 
                  key={chat.id} 
                  selected={selectedChatId === chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  sx={{ 
                    borderLeft: selectedChatId === chat.id ? '4px solid #0E4C5C' : '4px solid transparent',
                    bgcolor: selectedChatId === chat.id ? '#E0F2F1' : 'transparent',
                    '&:hover': { bgcolor: '#F5F5F5' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge color="error" variant="dot" invisible={chat.unread === 0}>
                      <Avatar sx={{ bgcolor: '#0E4C5C' }}>{chat.name.charAt(0)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight="bold" variant="body1">{chat.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{chat.time}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {chat.lastMsg}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* --- RIGHT SIDE: ACTIVE CHAT WINDOW [cite: 393-413] --- */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
            
            {/* Chat Header [cite: 393-394] */}
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#0E4C5C' }}>{activeChat.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{activeChat.name}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                     <Circle sx={{ fontSize: 10, color: 'success.main' }} />
                     <Typography variant="caption" color="text.secondary">
                       Treatment: {activeChat.treatment}
                     </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row">
                <IconButton><Phone /></IconButton>
                <IconButton><Videocam /></IconButton>
                <IconButton><MoreVert /></IconButton>
              </Stack>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#F9FAFB' }}>
              {activeChat.messages.map((msg) => (
                <Box 
                  key={msg.id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: msg.sender === 'dentist' ? 'flex-end' : 'flex-start',
                    mb: 2 
                  }}
                >
                  {/* Message Bubble */}
                  <Paper sx={{ 
                    p: 2, 
                    maxWidth: '70%', 
                    borderRadius: 2,
                    bgcolor: msg.sender === 'dentist' ? '#0E4C5C' : 'white', // Dentist = Teal, Patient = White
                    color: msg.sender === 'dentist' ? 'white' : 'text.primary',
                    boxShadow: 1
                  }}>
                    <Typography variant="body1">{msg.text}</Typography>
                    <Typography 
                      variant="caption" 
                      display="block" 
                      align="right" 
                      sx={{ mt: 0.5, opacity: 0.8, fontSize: '0.7rem' }}
                    >
                      {msg.time}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
              <Stack direction="row" spacing={2}>
                <TextField 
                  fullWidth 
                  placeholder="Type a message..." 
                  variant="outlined"
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  sx={{ bgcolor: '#F4F7F6', borderRadius: 1 }}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleSend}
                  sx={{ bgcolor: '#0E4C5C', color: 'white', '&:hover': { bgcolor: '#083642' } }}
                >
                  <Send />
                </IconButton>
              </Stack>
            </Box>

          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Messages;