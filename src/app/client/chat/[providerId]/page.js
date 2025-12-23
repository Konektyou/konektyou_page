'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSend, FiLoader } from 'react-icons/fi';
import { getClientToken, getClientData } from '@/lib/clientAuth';
import { getSocket, disconnectSocket } from '@/lib/socketClient';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params?.providerId;
  const [provider, setProvider] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialLoad = useRef(true);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProviderInfo = useCallback(async () => {
    if (!providerId) return;
    try {
      const response = await fetch(`/api/client/providers`);
      const data = await response.json();
      
      if (data.success && data.providers) {
        const foundProvider = data.providers.find(p => p.id === providerId);
        if (foundProvider) {
          setProvider(foundProvider);
        }
      }
    } catch (err) {
      console.error('Error fetching provider info:', err);
    }
  }, [providerId]);

  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!providerId) return;
    try {
      if (showLoading || isInitialLoad.current) {
        setLoading(true);
      }
      const token = getClientToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      const clientData = getClientData();
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Add client ID header for hex tokens (old format)
      if (clientData?.id) {
        headers['x-client-id'] = clientData.id;
      }

      const response = await fetch(`/api/client/messages/${providerId}`, {
        headers
      });

      const data = await response.json();
      if (data.success) {
        const newMessages = data.messages || [];
        // Only update if messages array reference or length changed
        setMessages(prev => {
          if (prev.length !== newMessages.length) {
            return newMessages;
          }
          // Check if any message IDs are different
          const prevIds = prev.map(m => m.id).join(',');
          const newIds = newMessages.map(m => m.id).join(',');
          if (prevIds !== newIds) {
            return newMessages;
          }
          return prev;
        });
        if (data.provider) {
          setProvider(prev => prev || data.provider);
        }
      }
      isInitialLoad.current = false;
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    if (!providerId) return;
    
    // Reset initial load flag when providerId changes
    isInitialLoad.current = true;
    
    fetchProviderInfo();
    fetchMessages(true); // Initial load with loading state
    
    // Initialize Socket.io connection
    const socket = getSocket();
    socketRef.current = socket;
    const clientData = getClientData();
    
    // Track connection status
    const updateConnectionStatus = (connected) => {
      setSocketConnected(connected);
      console.log(connected ? '✅ Socket.io CONNECTED' : '❌ Socket.io DISCONNECTED');
    };

    // Set initial connection status
    updateConnectionStatus(socket.connected);

    // Listen for connection status changes
    socket.on('connect', () => updateConnectionStatus(true));
    socket.on('disconnect', () => updateConnectionStatus(false));

    // Wait for socket to connect before setting up listeners
    const setupSocket = () => {
      if (!socket.connected) {
        console.log('⏳ Waiting for Socket.io connection...');
        socket.once('connect', setupSocket);
        return;
      }

      console.log('✅ Socket.io is connected, setting up listeners');
      
      // Authenticate socket connection
      if (clientData?.id) {
        console.log('🔐 Authenticating as client:', clientData.id);
        socket.emit('authenticate', {
          userId: clientData.id,
          userType: 'client'
        });
      }
      
      // Join conversation room
      if (providerId && clientData?.id) {
        console.log('🚪 Joining conversation room:', { providerId, clientId: clientData.id });
        socket.emit('joinConversation', {
          providerId: providerId,
          clientId: clientData.id
        });
      }
      
      // Listen for new messages
      const handleNewMessage = (message) => {
        console.log('📨 Received new message via Socket.io:', message);
        // Only add message if it's for this conversation
        if (message.providerId === providerId && message.clientId === clientData?.id) {
          setMessages(prev => {
            // Check if message already exists (avoid duplicates)
            const exists = prev.some(m => m.id === message.id);
            if (exists) {
              console.log('⚠️ Message already exists, skipping:', message.id);
              return prev;
            }
            
            // Remove any temp messages with the same text (sent by current user)
            const withoutTemp = prev.filter(m => {
              // Keep if it's not a temp message, or if it's a temp message with different text
              if (!m.id.startsWith('temp-')) return true;
              if (m.sender === message.sender && m.text === message.text) {
                console.log('🗑️ Removing temp message:', m.id);
                return false; // Remove temp message with same text
              }
              return true;
            });
            
            console.log('✅ Adding new message to UI:', message.id);
            // Add new message
            return [...withoutTemp, message];
          });
        } else {
          console.log('⚠️ Message not for this conversation, ignoring');
        }
      };
      
      socket.on('newMessage', handleNewMessage);
      
      // Store handler for cleanup
      socket._messageHandler = handleNewMessage;
    };

    if (socket.connected) {
      setupSocket();
    } else {
      socket.once('connect', setupSocket);
    }
    
    return () => {
      console.log('🧹 Cleaning up Socket.io listeners');
      // Leave conversation room
      if (socket.connected && clientData?.id) {
        socket.emit('leaveConversation', {
          providerId: providerId,
          clientId: clientData.id
        });
      }
      
      // Remove event listeners
      if (socket._messageHandler) {
        socket.off('newMessage', socket._messageHandler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending || !providerId) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageText.trim(),
      sender: 'client',
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const token = getClientToken();
      if (!token) throw new Error('Not authenticated');
      
      const clientData = getClientData();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Add client ID header for hex tokens (old format)
      if (clientData?.id) {
        headers['x-client-id'] = clientData.id;
      }

      const response = await fetch('/api/client/messages/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          providerId: providerId,
          text: messageToSend,
          clientId: clientData?.id // Also include in body as fallback
        })
      });

      const data = await response.json();
      if (data.success) {
        // Remove temp message - Socket.io will add the real one
        setMessages(prev => {
          // Remove temp message
          const withoutTemp = prev.filter(m => m.id !== tempMessage.id);
          // Check if real message already exists (from Socket.io)
          const exists = withoutTemp.some(m => m.id === data.message.id);
          if (!exists) {
            // If not exists, add it (fallback if Socket.io didn't fire)
            return [...withoutTemp, { ...data.message, read: false }];
          }
          return withoutTemp;
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setMessageText(messageToSend); // Restore message text
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col bg-white" style={{ margin: '-0.75rem', height: 'calc(100vh - 4.5rem)', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        {provider ? (
          <>
            {provider.photo ? (
              <img
                src={provider.photo}
                alt={provider.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {provider.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 truncate">{provider.name}</h2>
                <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} title={socketConnected ? 'Connected' : 'Disconnected'}></span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {socketConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'client'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'client' ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 p-4">
          <input
            ref={inputRef}
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={sending ? "Sending..." : "Type a message..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[2.5rem]"
            title={sending ? 'Sending...' : 'Send message'}
          >
            {sending ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

