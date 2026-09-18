import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { soundController } from '../components/AudioChime';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestCalledToken, setLatestCalledToken] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [queueTick, setQueueTick] = useState(0); // trigger re-fetch

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket.io Connected to Backend');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.io Disconnected');
      setIsConnected(false);
    });

    newSocket.on('TOKEN_CALLED', (data) => {
      console.log('📢 TOKEN_CALLED Event:', data);
      setLatestCalledToken(data);
      setQueueTick(prev => prev + 1);

      // Trigger Web Audio Chime and Voice Announcement
      soundController.announceToken(
        data.token.displayToken,
        data.doctor.name,
        data.doctor.roomNumber
      );
    });

    newSocket.on('TOKEN_RECALLED', (data) => {
      console.log('🔔 TOKEN_RECALLED Event:', data);
      soundController.announceToken(
        data.token.displayToken,
        data.doctor?.name || '',
        data.token.roomNumber || ''
      );
    });

    newSocket.on('TOKEN_COMPLETED', () => {
      setQueueTick(prev => prev + 1);
    });

    newSocket.on('TOKEN_CREATED', () => {
      setQueueTick(prev => prev + 1);
    });

    newSocket.on('QUEUE_UPDATED', () => {
      setQueueTick(prev => prev + 1);
    });

    newSocket.on('APPOINTMENT_BOOKED', () => {
      setQueueTick(prev => prev + 1);
    });

    newSocket.on('PATIENT_CHECKED_IN', () => {
      setQueueTick(prev => prev + 1);
    });

    newSocket.on('DATA_RESET', () => {
      setQueueTick(prev => prev + 1);
    });

    // Real-time SMS & WhatsApp Toast Simulation
    newSocket.on('NOTIFICATION_DISPATCHED', (notif) => {
      setRecentNotifications(prev => [notif, ...prev.slice(0, 4)]);
      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setRecentNotifications(prev => prev.filter(n => n.id !== notif.id));
      }, 7000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const toggleSound = () => {
    const muted = soundController.toggleMute();
    setIsAudioMuted(muted);
  };

  const testChime = () => {
    soundController.playChime();
  };

  const dismissNotification = (id) => {
    setRecentNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      latestCalledToken,
      queueTick,
      recentNotifications,
      isAudioMuted,
      toggleSound,
      testChime,
      dismissNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
