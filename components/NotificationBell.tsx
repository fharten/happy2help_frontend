'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Dot, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Notification } from '@/types/notification';
import { AuthUser } from '@/types/auth';
import { isUser, isNgo } from '@/lib/user-utils';

interface NotificationBellProps {
  user: AuthUser;
}

// SWR fetcher function with authentication
const fetcher = async (url: string) => {
  const tokens = localStorage.getItem('auth_tokens');
  if (!tokens) {
    throw new Error('No authentication token found');
  }

  const { accessToken } = JSON.parse(tokens);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Network error - check if backend is running and CORS is configured',
      );
    }
    throw error;
  }
};

const NotificationBell = ({ user }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const getEndpoints = () => {
    if (isUser(user)) {
      return {
        fetch: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/users/${user.id}`,
        stream: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/users/${user.id}`,
      };
    } else if (isNgo(user)) {
      return {
        fetch: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/ngos/${user.id}`,
        stream: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/ngos/${user.id}`,
      };
    }
    return null;
  };

  const endpoints = getEndpoints();

  const {
    data: response,
    error,
    mutate,
    isLoading,
  } = useSWR<{ success: boolean; message: string; data: Notification[] }>(
    endpoints?.fetch,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      errorRetryCount: 3,
    },
  );

  const notifications = response?.data || [];

  // Custom SSE implementation using fetch with ReadableStream
  useEffect(() => {
    if (!endpoints?.stream || !user.id) return;

    const connectSSE = async () => {
      try {
        const tokens = localStorage.getItem('auth_tokens');
        if (!tokens) {
          console.error('No auth tokens found for SSE connection');
          return;
        }

        const { accessToken } = JSON.parse(tokens);

        // Create abort controller for this connection
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const response = await fetch(endpoints.stream, {
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
          credentials: 'include', // Include cookies
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        setIsConnected(true);
        console.log('SSE connection established');

        const reader = response.body.getReader();
        readerRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('SSE stream ended');
              break;
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            let eventType = '';
            let eventData = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.substring(6).trim();
              } else if (line.startsWith('data:')) {
                eventData = line.substring(5).trim();
              } else if (line === '') {
                // Empty line indicates end of event
                if (eventData) {
                  handleSSEEvent(eventType, eventData);
                  eventType = '';
                  eventData = '';
                }
              }
            }
          }
        } catch (readError) {
          if (readError.name !== 'AbortError') {
            console.error('Error reading SSE stream:', readError);
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error setting up SSE connection:', error);
          setIsConnected(false);

          // Attempt to reconnect after delay
          setTimeout(() => {
            if (!abortControllerRef.current?.signal.aborted) {
              console.log('Attempting to reconnect SSE...');
              connectSSE();
            }
          }, 5000);
        }
      }
    };

    const handleSSEEvent = (eventType: string, data: string) => {
      try {
        const parsedData = JSON.parse(data);
        console.log(`SSE event (${eventType}):`, parsedData);

        switch (eventType) {
          case 'notification':
            console.log('New notification received');
            mutate(); // Refresh notifications
            break;
          case 'notification_updated':
            console.log('Notification updated');
            mutate(); // Refresh notifications
            break;
          case 'ping':
            // Heartbeat - no action needed
            break;
          default:
            // Handle generic messages or connection confirmations
            if (parsedData.type === 'connected') {
              console.log('SSE connection confirmed');
            } else {
              mutate(); // Refresh on any other event
            }
        }
      } catch (error) {
        console.error('Error parsing SSE event data:', error);
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      setIsConnected(false);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }
    };
  }, [endpoints?.stream, user.id, mutate]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (!tokens) {
        throw new Error('No authentication token found');
      }

      const { accessToken } = JSON.parse(tokens);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/${notificationId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ read: true }),
        },
      );

      if (response.ok) {
        const updatedNotifications = notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        );
        mutate(
          {
            success: true,
            message: 'Updated successfully',
            data: updatedNotifications,
          },
          false,
        );
      } else {
        throw new Error(
          `Failed to mark notification as read: ${response.status}`,
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      mutate();
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);

    try {
      await Promise.all(
        unreadNotifications.map((notification) => markAsRead(notification.id)),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!endpoints) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className='relative p-2 lg:p-2.5 rounded-full hover:bg-gray-100/60 transition-all duration-200'>
          <Bell size={20} strokeWidth={2} className='text-prussian/70' />

          {/* Connection Status Indicator */}
          <div
            className={`absolute top-0 right-0 w-2 h-2 rounded-full transition-colors duration-200 ${
              isConnected ? 'bg-green-400' : 'bg-gray-400'
            }`}
            title={isConnected ? 'Real-time updates active' : 'Connecting...'}
          />

          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className='w-80 p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-xl'
        side='bottom'
        align='center'
      >
        <div className='p-4 border-b border-gray-200/50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-prussian'>
                Benachrichtigungen
              </h3>
              {/* SSE Status Indicator */}
              <div className='flex items-center gap-1'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                />
                <span className='text-xs text-gray-500'>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className='text-xs text-light-mint hover:text-mint transition-colors duration-200 font-medium'
              >
                Alle als gelesen markieren
              </button>
            )}
          </div>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {isLoading ? (
            <div className='p-4 text-center text-prussian/60'>Laden...</div>
          ) : error ? (
            <div className='p-6 text-center text-prussian/60'>
              <Bell size={32} className='mx-auto mb-2 opacity-50' />
              <p className='text-sm'>
                Fehler beim Laden der Benachrichtigungen
              </p>
              <button
                onClick={() => mutate()}
                className='text-xs text-light-mint hover:text-mint mt-2 transition-colors duration-200'
              >
                Erneut versuchen
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className='p-6 text-center text-prussian/60'>
              <Bell size={32} className='mx-auto mb-2 opacity-50' />
              <p className='text-sm'>Keine Benachrichtigungen</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-200/30'>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer ${
                    !notification.read ? 'bg-light-mint/10' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-1'>
                      {notification.read ? (
                        <CheckCircle2 size={16} className='text-gray-400' />
                      ) : (
                        <Dot size={20} className='text-light-mint' />
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h4
                        className={`text-sm font-medium ${
                          notification.read
                            ? 'text-prussian/70'
                            : 'text-prussian'
                        }`}
                      >
                        {notification.name}
                      </h4>
                      <p
                        className={`text-xs mt-1 ${
                          notification.read
                            ? 'text-prussian/50'
                            : 'text-prussian/70'
                        }`}
                      >
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className='p-3 border-t border-gray-200/50 bg-gray-50/30'>
            <button className='w-full text-center text-xs text-prussian/70 hover:text-prussian transition-colors duration-200'>
              Alle Benachrichtigungen anzeigen
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
