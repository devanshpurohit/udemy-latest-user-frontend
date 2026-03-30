import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import config from '../config/config';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        let newSocket;

        if (isAuthenticated) {
            console.log('🔌 Connecting to socket server:', config.SOCKET_URL);
            newSocket = io(config.SOCKET_URL, {
                reconnection: true,
                reconnectionAttempts: 20,
                reconnectionDelay: 1000,
                transports: ['polling', 'websocket'],
                withCredentials: true
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
            });

            setSocket(newSocket);
        } else {
            console.log('🔌 Disconnecting socket (unauthenticated)');
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
