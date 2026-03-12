import React, { useState, useEffect, useRef } from 'react';
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
  
  const [menuOpenForId, setMenuOpenForId] = useState(null);

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
    setMenuOpenForId(null);
  };

  const activeDentist = dentists.find(d => (d.dentistId || d.id) === selectedDentistId);

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 h-[calc(100vh-80px)] flex flex-col"> 
      <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary-dark mb-6 shrink-0">
        Secure Messages
      </h1>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-grow overflow-hidden relative">
        
        {/* LEFT SIDE: DENTISTS */}
        <div className="w-80 border-r border-slate-200 bg-slate-50 flex-col hidden md:flex shrink-0">
          <div className="p-4 bg-white border-b border-slate-200">
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search fontSize="small" />
               </div>
               <input 
                  type="text" 
                  placeholder="Search clinic staff..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
               />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {dentists.map((dentist, index) => {
              const dId = dentist.dentistId || dentist.id;
              const isSelected = selectedDentistId === dId;
              return (
                <div 
                  key={`dentist-${dId || index}`}
                  onClick={() => setSelectedDentistId(dId)} 
                  className={`flex items-center p-4 cursor-pointer transition-colors border-l-4 border-b border-b-slate-100 ${
                    isSelected ? 'bg-white border-l-primary' : 'border-l-transparent hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary-dark text-white flex items-center justify-center font-bold shadow-sm shrink-0 mr-4">
                    {dentist.name ? dentist.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`font-bold truncate ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}>
                      Dr. {dentist.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {dentist.specialization || 'Dentist'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: CHAT */}
        <div className="flex-grow flex flex-col bg-slate-50/50 min-w-0 relative">
          {activeDentist ? (
            <>
              {/* Header */}
              <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary-dark text-white flex items-center justify-center font-bold shadow-sm shrink-0 mr-4">
                    {activeDentist.name ? activeDentist.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Dr. {activeDentist.name || 'Unknown'}</h3>
                    <p className="text-xs font-semibold text-slate-500">{activeDentist.specialization || 'Dentist'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Circle className={isConnected ? 'text-green-500' : 'text-orange-500'} style={{ fontSize: 10 }} />
                  <span className="text-xs font-bold text-slate-600">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow p-6 overflow-y-auto" style={{ backgroundColor: '#F4F7F6' }}>
                {loadingHistory ? (
                  <div className="flex justify-center items-center h-full">
                     <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isPatient = msg.senderType === 'PATIENT';
                    const showMenu = menuOpenForId === msg.messageId;

                    return (
                      <div key={`msg-${msg.messageId || index}`} className={`flex mb-4 ${isPatient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[70%] group`}>
                           {/* Context Menu Button (visible on hover) */}
                           {isPatient && (
                               <div className={`absolute top-0 -left-8 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                   <button 
                                      className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                                      onClick={() => setMenuOpenForId(showMenu ? null : msg.messageId)}
                                   >
                                       <MoreVert fontSize="small" />
                                   </button>
                                   
                                   {/* Dropdown Menu */}
                                   {showMenu && (
                                       <div className="absolute right-0 top-6 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20">
                                           <button 
                                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                              onClick={() => {
                                                  setEditingMessage(msg);
                                                  setNewMessage(msg.content);
                                                  setMenuOpenForId(null);
                                              }}
                                           >
                                               <Edit fontSize="small" className="mr-2" /> Edit
                                           </button>
                                           <button 
                                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                              onClick={() => handleDelete(msg.messageId)}
                                           >
                                               <Delete fontSize="small" className="mr-2" /> Delete
                                           </button>
                                       </div>
                                   )}
                               </div>
                           )}

                           {/* Message Bubble */}
                           <div className={`p-3 px-4 shadow-sm ${
                              isPatient 
                                ? 'bg-primary-dark text-white rounded-2xl rounded-tr-sm' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                           }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap word-break-words">{msg.content}</p>
                              
                              <div className={`flex justify-end items-center mt-1 space-x-2 ${isPatient ? 'text-white/70' : 'text-slate-400'}`}>
                                  {msg.isEdited && <span className="text-[0.65rem] italic">(edited)</span>}
                                  <span className="text-[0.65rem] font-medium">{msg.sentAt ? dayjs(msg.sentAt).format('h:mm A') : 'Now'}</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                  <div className="absolute bottom-24 left-4 md:left-[340px] z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                      <EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} />
                  </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {editingMessage && (
                  <div className="flex justify-between items-center mb-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                    <span className="font-semibold flex items-center"><Edit fontSize="small" className="mr-2" /> Editing message</span>
                    <button 
                        className="text-yellow-600 hover:text-yellow-900 focus:outline-none bg-yellow-100 hover:bg-yellow-200 p-1 rounded-full transition-colors"
                        onClick={() => { setEditingMessage(null); setNewMessage(''); }}
                    >
                        <Close fontSize="small" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <button 
                      className={`p-2 rounded-full transition-colors focus:outline-none ${showEmojiPicker ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      disabled={!isConnected}
                  >
                      <EmojiEmotions />
                  </button>
                  
                  <input 
                    type="text" 
                    className="flex-grow px-5 py-3 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-400 disabled:opacity-50"
                    placeholder={isConnected ? "Type a message..." : "Connecting to server..."}
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && isConnected) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={!isConnected}
                  />
                  
                  <button 
                    onClick={handleSend} 
                    disabled={!isConnected || !newMessage.trim()}
                    className={`p-3 rounded-full flex items-center justify-center transition-all focus:outline-none shadow-md ${
                        isConnected && newMessage.trim() 
                            ? 'bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5' 
                            : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Send fontSize="small" className={isConnected && newMessage.trim() ? 'ml-1' : ''} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search fontSize="large" className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">No Conversation Selected</h3>
                <p className="max-w-xs">Select a doctor from the list on the left to start a secure messaging session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMessages;