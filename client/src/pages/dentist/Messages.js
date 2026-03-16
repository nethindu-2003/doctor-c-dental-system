import React, { useState, useEffect, useRef } from 'react';
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

  // Custom Dropdown State
  const [menuOpenId, setMenuOpenId] = useState(null);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setMenuOpenId(null);
  };

  const activePatient = patients.find(p => (p.patientId || p.id) === selectedPatientId);

  return (
    <div className="font-sans text-slate-800 animate-fade-in p-2 md:p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
        
        {/* --- LEFT SIDE: PATIENTS --- */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-[40vh] md:h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-100 shrink-0">
            <h2 className="text-xl font-bold font-poppins text-[#0E4C5C] mb-4">Conversations</h2>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                 <Search fontSize="small" />
               </div>
               <input 
                 type="text"
                 className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0E4C5C] focus:ring-2 focus:ring-[#0E4C5C]/20 transition-all text-sm shadow-sm"
                 placeholder="Search patients..."
               />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {patients.map((patient, index) => {
              const pId = patient.patientId || patient.id;
              const isSelected = selectedPatientId === pId;
              return (
                <button
                  key={`patient-${pId || index}`}
                  onClick={() => { setSelectedPatientId(pId); setEditingMessage(null); }}
                  className={`w-full flex items-center p-3 rounded-2xl transition-all text-left focus:outline-none ${isSelected ? 'bg-slate-100 shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-50'}`}
                >
                  <div className="relative">
                      {/* --- UPDATE: Profile Picture handling for Sidebar --- */}
                      <div className="w-10 h-10 rounded-full bg-[#0E4C5C] flex items-center justify-center text-white font-bold shrink-0 shadow-sm overflow-hidden">
                        {patient.profilePicture ? (
                            <img src={patient.profilePicture} alt={patient.name} className="w-full h-full object-cover" />
                        ) : (
                            patient.name ? patient.name.charAt(0).toUpperCase() : 'P'
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className={`font-bold truncate text-sm leading-tight mb-0.5 ${isSelected ? 'text-[#0E4C5C]' : 'text-slate-700'}`}>
                        {patient.name || 'Unknown Patient'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">Patient ID: {pId}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT SIDE: CHAT WINDOW --- */}
        <div className="w-full md:w-2/3 lg:w-3/4 h-[55vh] md:h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
          {activePatient ? (
            <>
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0 z-10 shadow-sm">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {/* --- UPDATE: Profile Picture handling for Chat Header --- */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0E4C5C] flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden">
                      {activePatient.profilePicture ? (
                          <img src={activePatient.profilePicture} alt={activePatient.name} className="w-full h-full object-cover" />
                      ) : (
                          activePatient.name ? activePatient.name.charAt(0).toUpperCase() : 'P'
                      )}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-poppins text-slate-800 leading-tight">
                        {activePatient.name || 'Unknown Patient'}
                    </h2>
                    <div className="flex items-center mt-0.5">
                       <Circle fontSize="inherit" className={`text-[10px] sm:text-xs mr-1.5 ${isConnected ? 'text-green-500' : 'text-orange-500 animate-pulse'}`} />
                       <p className="text-xs font-semibold text-slate-500">
                         {isConnected ? 'Connected' : 'Connecting...'} <span className="mx-1">•</span> ID: {activePatient.patientId || activePatient.id}
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-slate-50/50 space-y-4" onClick={() => setShowEmojiPicker(false)}>
                {loadingHistory ? (
                   <div className="flex justify-center items-center h-full">
                       <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0E4C5C] rounded-full animate-spin"></div>
                   </div>
                ) : (
                  messages.map((msg, index) => {
                    const isDentist = msg.senderType === 'DENTIST';
                    const showMenu = menuOpenId === msg.messageId;

                    return (
                      <div key={`msg-${msg.messageId || index}`} className={`flex gap-3 ${isDentist ? 'justify-end' : 'justify-start'}`}>
                        {/* Patient Avatar - Left side */}
                        {!isDentist && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0E4C5C] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm overflow-hidden border border-slate-200">
                            {activePatient?.profilePicture ? (
                              <img src={activePatient.profilePicture} alt={activePatient?.name} className="w-full h-full object-cover" />
                            ) : (
                              activePatient?.name ? activePatient.name.charAt(0).toUpperCase() : 'P'
                            )}
                          </div>
                        )}

                        <div className={`relative max-w-[85%] sm:max-w-[70%] group`}>
                            <div className={`p-3 sm:p-4 rounded-2xl shadow-sm text-sm sm:text-base ${
                                isDentist 
                                  ? 'bg-[#0E4C5C] text-white rounded-tr-sm' 
                                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                            }`}>
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                              
                              <div className={`flex items-center justify-end space-x-2 mt-2 font-medium text-[0.65rem] sm:text-xs ${isDentist ? 'text-white/70' : 'text-slate-400'}`}>
                                {msg.isEdited && <span>(edited)</span>}
                                <span>{msg.sentAt ? dayjs(msg.sentAt).format('h:mm A') : 'Now'}</span>
                              </div>
                            </div>
                            
                            {/* 3-Dot Menu for Own Messages */}
                            {isDentist && (
                              <div className="absolute top-1/2 -translate-y-1/2 -left-10 opacity-0 group-hover:opacity-100 transition-opacity" ref={showMenu ? menuRef : null}>
                                  <button 
                                      className="p-1.5 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 rounded-full shadow-sm border border-slate-100 focus:outline-none transition-all"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setMenuOpenId(showMenu ? null : msg.messageId); 
                                      }}
                                  >
                                      <MoreVert fontSize="small" />
                                  </button>
                                  
                                  {/* Custom Menu Dropdown */}
                                  {showMenu && (
                                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                                          <button 
                                              className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 text-sm font-semibold text-slate-700 transition-colors"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingMessage(msg); 
                                                  setNewMessage(msg.content); 
                                                  setMenuOpenId(null);
                                              }}
                                          >
                                              <Edit fontSize="small" className="text-slate-400" />
                                              <span>Edit</span>
                                          </button>
                                          <button 
                                              className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center space-x-2 text-sm font-semibold text-red-600 transition-colors border-t border-slate-50"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDelete(msg.messageId);
                                              }}
                                          >
                                              <Delete fontSize="small" />
                                              <span>Delete</span>
                                          </button>
                                      </div>
                                  )}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div className="absolute bottom-[90px] sm:bottom-[100px] left-4 sm:left-auto right-4 z-20 shadow-2xl rounded-2xl overflow-hidden animate-fade-in origin-bottom-right">
                  <EmojiPicker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} width="100%" height={350} />
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 z-10">
                {editingMessage && (
                  <div className="flex justify-between items-center mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
                    <p className="text-xs sm:text-sm font-semibold text-yellow-800 flex items-center">
                        <Edit fontSize="small" className="mr-2" />
                        Editing message...
                    </p>
                    <button 
                       className="p-1 rounded-full text-yellow-600 hover:bg-yellow-100 transition-colors focus:outline-none"
                       onClick={() => { setEditingMessage(null); setNewMessage(''); }}
                    >
                        <Close fontSize="small" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-end space-x-2 sm:space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-[#0E4C5C] focus-within:ring-2 focus-within:ring-[#0E4C5C]/20 transition-all shadow-sm">
                  <button 
                      className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors focus:outline-none shrink-0"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                      <EmojiEmotions />
                  </button>
                  
                  <textarea 
                    className="w-full bg-transparent outline-none text-sm sm:text-base resize-none py-2.5 sm:py-3 max-h-32 placeholder-slate-400"
                    placeholder={isConnected ? "Type a message..." : "Connecting to server..."}
                    disabled={!isConnected}
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (isConnected) handleSend();
                        }
                    }}
                    rows={1}
                    style={{ minHeight: '44px' }}
                  ></textarea>

                  <button 
                    onClick={handleSend}
                    disabled={!isConnected || !newMessage.trim()}
                    className={`p-2 sm:p-3 rounded-xl flex items-center justify-center shrink-0 transition-all focus:outline-none shadow-sm ${
                        isConnected && newMessage.trim() 
                          ? 'bg-[#0E4C5C] text-white hover:bg-[#0a3541] hover:shadow-md' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send fontSize="small" className={isConnected && newMessage.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-2 font-medium">Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-sans mx-0.5">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-sans mx-0.5">Shift</kbd> + <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-500 font-sans mx-0.5">Enter</kbd> for new line</p>
              </div>

            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold font-poppins text-slate-700 mb-2">No Conversation Selected</h3>
                <p className="text-slate-500 max-w-sm">Choose a patient from the list on the left to start sending and receiving messages.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DentistMessages;