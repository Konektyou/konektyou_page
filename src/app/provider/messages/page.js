'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiMessageCircle, FiLoader, FiSend } from 'react-icons/fi';
import { getProviderToken, getProviderData } from '@/lib/providerAuth';
import { getSocket, disconnectSocket } from '@/lib/socketClient';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialLoad = useRef(true);
  const isInitialMessagesLoad = useRef(true);
  const selectedClientIdRef = useRef(null);
  const socketRef = useRef(null);
  const hasAutoSelectedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading || isInitialLoad.current) {
        setLoading(true);
      }
      const token = getProviderToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/provider/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const newConversations = data.conversations || [];
        setConversations(prev => {
          // Only update if conversations actually changed
          if (prev.length !== newConversations.length) {
            return newConversations;
          }
          // Check if any conversation IDs are different
          const prevIds = prev.map(c => c.id).join(',');
          const newIds = newConversations.map(c => c.id).join(',');
          if (prevIds !== newIds) {
            return newConversations;
          }
          return prev;
        });
        
        // Auto-select conversation from URL params if provided
        const clientIdFromUrl = searchParams?.get('clientId');
        if (clientIdFromUrl && !hasAutoSelectedRef.current) {
          const conversationToSelect = newConversations.find(c => c.clientId === clientIdFromUrl);
          if (conversationToSelect) {
            setSelectedConversation(conversationToSelect);
            hasAutoSelectedRef.current = true;
          }
        } else {
          // Update selected conversation if it exists (without causing re-render loop)
          setSelectedConversation(prev => {
            if (!prev) return prev;
            const updated = newConversations.find(c => c.clientId === prev.clientId);
            if (updated) {
              // Only update if something actually changed
              if (updated.lastMessage !== prev.lastMessage || 
                  updated.unreadCount !== prev.unreadCount ||
                  updated.lastMessageTime?.toString() !== prev.lastMessageTime?.toString()) {
                return updated;
              }
            }
            return prev;
          });
        }
      }
      isInitialLoad.current = false;
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchMessages = useCallback(async (clientId, showLoading = false) => {
    if (!clientId) return;
    try {
      if (showLoading || isInitialMessagesLoad.current) {
        setMessagesLoading(true);
      }
      const token = getProviderToken();
      if (!token) {
        setMessagesLoading(false);
        return;
      }

      const response = await fetch(`/api/provider/messages/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const newMessages = data.messages || [];
        setMessages(prev => {
          // Only update if messages actually changed
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
        
        if (data.client) {
          setSelectedConversation(prev => {
            if (!prev || prev.clientId !== clientId) return prev;
            return {
              ...prev,
              clientName: data.client.name,
              clientPhoto: data.client.photo
            };
          });
        }
      }
      isInitialMessagesLoad.current = false;
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Watch for URL parameter changes to auto-select conversation
  useEffect(() => {
    const clientIdFromUrl = searchParams?.get('clientId');
    if (clientIdFromUrl && conversations.length > 0) {
      const conversationToSelect = conversations.find(c => c.clientId === clientIdFromUrl);
      if (conversationToSelect && selectedConversation?.clientId !== clientIdFromUrl) {
        setSelectedConversation(conversationToSelect);
        hasAutoSelectedRef.current = true;
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    fetchConversations(true); // Initial load with loading state
    
    // Initialize Socket.io connection
    const socket = getSocket();
    socketRef.current = socket;
    const providerData = getProviderData();
    
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
      if (providerData?.id) {
        console.log('🔐 Authenticating as provider:', providerData.id);
        socket.emit('authenticate', {
          userId: providerData.id,
          userType: 'provider'
        });
      }
      
      // Listen for new messages to update conversations list
      const handleNewMessage = (message) => {
        console.log('📨 Received new message (updating conversations):', message);
        // Refresh conversations when a new message arrives
        fetchConversations(false);
      };
      
      socket.on('newMessage', handleNewMessage);
      socket._conversationHandler = handleNewMessage;
    };

    if (socket.connected) {
      setupSocket();
    } else {
      socket.once('connect', setupSocket);
    }
    
    return () => {
      console.log('🧹 Cleaning up Socket.io listeners');
      if (socket._conversationHandler) {
        socket.off('newMessage', socket._conversationHandler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation?.clientId) {
      const clientId = selectedConversation.clientId;
      const providerData = getProviderData();
      const providerId = providerData?.id;
      
      // Only fetch if client ID changed
      if (selectedClientIdRef.current !== clientId) {
        selectedClientIdRef.current = clientId;
        isInitialMessagesLoad.current = true;
        fetchMessages(clientId, true); // Initial load with loading state
      }
      
      // Setup Socket.io for this conversation
      const socket = socketRef.current || getSocket();
      
      // Wait for socket to connect
      const setupConversationSocket = () => {
        if (!socket.connected) {
          console.log('⏳ Waiting for Socket.io connection before joining conversation...');
          socket.once('connect', setupConversationSocket);
          return;
        }

        console.log('✅ Socket.io connected, joining conversation room');
        
        // Join conversation room
        if (providerId && clientId) {
          console.log('🚪 Joining conversation room:', { providerId, clientId });
          socket.emit('joinConversation', {
            providerId: providerId,
            clientId: clientId
          });
        }
        
        // Listen for new messages in this conversation
        const handleNewMessage = (message) => {
          console.log('📨 Received new message via Socket.io:', message);
          // Only add message if it's for this conversation
          if (message.providerId === providerId && message.clientId === clientId) {
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
        socket._conversationMessageHandler = handleNewMessage;
      };

      if (socket.connected) {
        setupConversationSocket();
      } else {
        socket.once('connect', setupConversationSocket);
      }
      
      return () => {
        console.log('🧹 Cleaning up conversation Socket.io listeners');
        // Leave conversation room
        if (socket.connected && providerId && clientId) {
          socket.emit('leaveConversation', {
            providerId: providerId,
            clientId: clientId
          });
        }
        
        // Remove event listeners
        if (socket._conversationMessageHandler) {
          socket.off('newMessage', socket._conversationMessageHandler);
        }
      };
    } else {
      selectedClientIdRef.current = null;
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending || !selectedConversation) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageText.trim(),
      sender: 'provider',
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const token = getProviderToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/provider/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: selectedConversation.clientId,
          text: messageToSend
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
        // Refresh conversations to update last message (without loading state)
        fetchConversations(false);
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

  const formatConversationTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.clientName.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col bg-white" style={{ margin: '-0.75rem', height: 'calc(100vh - 4.5rem)', minHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex h-full">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-12 text-center">
                <FiMessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Start chatting with your clients!</p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    {conversation.clientPhoto ? (
                      <img
                        src={conversation.clientPhoto}
                        alt={conversation.clientName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium text-sm">
                          {conversation.clientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{conversation.clientName}</h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conversation.lastMessage || 'No messages yet'}</p>
                      {conversation.lastMessageTime && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatConversationTime(conversation.lastMessageTime)}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat View */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                {selectedConversation.clientPhoto ? (
                  <img
                    src={selectedConversation.clientPhoto}
                    alt={selectedConversation.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {selectedConversation.clientName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900 truncate">{selectedConversation.clientName}</h2>
                    <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} title={socketConnected ? 'Connected' : 'Disconnected'}></span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {socketConnected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 relative">
                {messagesLoading ? (
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
                        className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            message.sender === 'provider'
                              ? 'bg-black text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === 'provider' ? 'text-gray-300' : 'text-gray-500'
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FiMessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Select a conversation</p>
                <p className="text-gray-400 text-sm mt-1">Choose a client from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

