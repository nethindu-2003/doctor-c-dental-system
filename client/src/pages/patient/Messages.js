import React, { useState } from 'react';
import { 
  Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, 
  Avatar, TextField, IconButton, Badge, Divider, Stack, InputAdornment 
} from '@mui/material';
import { 
  Send, Search, AttachFile, MoreVert, Circle, SentimentSatisfiedAlt 
} from '@mui/icons-material';

// --- MOCK DATA ---
const contacts = [
  { 
    id: 1, 
    name: 'Dr. Chasika Waduge', 
    role: 'Lead Surgeon', 
    avatar: 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg?w=200', 
    status: 'online',
    unread: 2,
    lastMessage: 'Please take the prescribed medication.',
    time: '10:05 AM'
  },
  { 
    id: 2, 
    name: 'Dr. Emily Carter', 
    role: 'Restorative Dentist', 
    avatar: 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg?w=200', 
    status: 'offline',
    unread: 0,
    lastMessage: 'See you next Tuesday!',
    time: 'Yesterday'
  },
  { 
    id: 3, 
    name: 'Front Desk / Admin', 
    role: 'Support', 
    avatar: '', // Fallback avatar
    status: 'online',
    unread: 0,
    lastMessage: 'Your payment receipt has been sent.',
    time: 'Jul 10'
  }
];

const initialMessages = {
  1: [
    { id: 1, sender: 'doctor', text: 'Hi Sophia, how is your tooth feeling after the root canal?', time: '09:00 AM' },
    { id: 2, sender: 'me', text: 'It feels much better, thank you Dr. Chasika! Just a little sensitivity to cold.', time: '09:05 AM' },
    { id: 3, sender: 'doctor', text: 'That is normal for a few days. Are you taking the painkillers?', time: '09:10 AM' },
    { id: 4, sender: 'me', text: 'Yes, I took one this morning.', time: '09:15 AM' },
    { id: 5, sender: 'doctor', text: 'Great. Please take the prescribed medication if the pain persists. Let me know if swelling occurs.', time: '10:05 AM' },
  ],
  2: [
    { id: 1, sender: 'me', text: 'Hi Dr. Emily, can I reschedule my appointment?', time: 'Yesterday' },
    { id: 2, sender: 'doctor', text: 'Sure Sophia, we have a slot next Tuesday at 2 PM. Does that work?', time: 'Yesterday' },
    { id: 3, sender: 'doctor', text: 'See you next Tuesday!', time: 'Yesterday' },
  ],
  3: [
    { id: 1, sender: 'doctor', text: 'Your payment receipt has been sent to your email.', time: 'Jul 10' },
  ]
};

const Messages = () => {
  const [selectedContactId, setSelectedContactId] = useState(1);
  const [inputText, setInputText] = useState('');
  
  // Get current active chat data
  const activeContact = contacts.find(c => c.id === selectedContactId);
  const activeMessages = initialMessages[selectedContactId] || [];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    // In a real app, you would push this to the backend/state
    alert(`Sent: "${inputText}"`); 
    setInputText('');
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)' }}> {/* Fill remaining height */}
      <Typography variant="h4" fontFamily="Playfair Display" fontWeight="bold" color="primary.dark" sx={{ mb: 3 }}>
        Messages
      </Typography>

      <Paper 
        elevation={0} 
        sx={{ 
          height: '100%', 
          borderRadius: 4, 
          border: '1px solid #e0e0e0', 
          overflow: 'hidden',
          display: 'flex' 
        }}
      >
        {/* --- LEFT SIDE: CONTACTS LIST --- */}
        <Box sx={{ 
          width: 320, 
          borderRight: '1px solid #e0e0e0', 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          bgcolor: '#FAFAFA'
        }}>
          {/* Search Bar */}
          <Box sx={{ p: 2 }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Search conversations..." 
              InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
          </Box>
          <Divider />
          
          {/* List */}
          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {contacts.map((contact) => (
              <React.Fragment key={contact.id}>
                <ListItem 
                  button 
                  selected={selectedContactId === contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  sx={{ 
                    py: 2, 
                    bgcolor: selectedContactId === contact.id ? 'white' : 'transparent',
                    borderLeft: selectedContactId === contact.id ? '4px solid #0E4C5C' : '4px solid transparent'
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{ '& .MuiBadge-badge': { bgcolor: contact.status === 'online' ? '#44b700' : 'grey', boxShadow: '0 0 0 2px white' } }}
                    >
                      <Avatar src={contact.avatar} alt={contact.name} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: 120 }}>{contact.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{contact.time}</Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {contact.lastMessage}
                      </Typography>
                    }
                  />
                  {contact.unread > 0 && (
                     <Badge badgeContent={contact.unread} color="error" sx={{ ml: 1 }} />
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* --- RIGHT SIDE: CHAT WINDOW --- */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
          
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={activeContact.avatar} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{activeContact.name}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                   <Circle sx={{ fontSize: 10, color: activeContact.status === 'online' ? '#44b700' : 'grey' }} />
                   <Typography variant="caption" color="text.secondary">
                     {activeContact.status === 'online' ? 'Online' : 'Offline'} • {activeContact.role}
                   </Typography>
                </Stack>
              </Box>
            </Box>
            <IconButton><MoreVert /></IconButton>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#F4F7F6', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeMessages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <Box 
                  key={msg.id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: isMe ? 'flex-end' : 'flex-start' 
                  }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      maxWidth: '70%', 
                      borderRadius: 3,
                      borderTopRightRadius: isMe ? 0 : 12,
                      borderTopLeftRadius: isMe ? 12 : 0,
                      bgcolor: isMe ? 'primary.main' : 'white',
                      color: isMe ? 'white' : 'text.primary',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        textAlign: 'right', 
                        opacity: 0.8,
                        fontSize: '0.7rem' 
                      }}
                    >
                      {msg.time}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <IconButton color="primary"><AttachFile /></IconButton>
              </Grid>
              <Grid item xs>
                <TextField 
                  fullWidth 
                  placeholder="Type a message..." 
                  size="small"
                  variant="outlined"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: '#f9f9f9' } 
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small"><SentimentSatisfiedAlt /></IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item>
                <IconButton 
                  color="primary" 
                  sx={{ bgcolor: 'secondary.main', color: 'primary.dark', '&:hover': { bgcolor: 'secondary.dark' } }}
                  onClick={handleSendMessage}
                >
                  <Send />
                </IconButton>
              </Grid>
            </Grid>
          </Box>

        </Box>
      </Paper>
    </Box>
  );
};

export default Messages;