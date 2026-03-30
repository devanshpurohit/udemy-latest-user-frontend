import React, { useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';

/**
 * Headless component to handle global socket events
 * like real-time answer notifications.
 */
const SocketListener = () => {
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            console.log('🎧 SocketListener active');

            const handleAnswer = (updatedQuestion) => {
                // Show a global toast notification for the student
                // We only show it outside the FAQ page to avoid double toasts
                // or just always show a subtle one. 
                // For now, let's just show it.
                if (window.location.pathname !== '/faq') {
                    toast.success(
                        <div>
                            <strong>New Answer Received!</strong>
                            <p className="small mb-0 mt-1">An admin has replied to your question.</p>
                        </div>,
                        {
                            onClick: () => window.location.href = '/faq',
                            toastId: `answer_${updatedQuestion._id}` // Prevent duplicates
                        }
                    );
                }
            };

            socket.on('answer_received', handleAnswer);

            return () => {
                socket.off('answer_received', handleAnswer);
            };
        }
    }, [socket]);

    return null; // Headless
};

export default SocketListener;
