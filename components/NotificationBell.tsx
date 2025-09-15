"use client";

import { useEffect, useState } from "react";
import { Bell, Dot, CheckCircle2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@/types/notification";

interface NotificationBellProps {
  userId?: string;
  ngoId?: string;
}

const NotificationBell = ({ userId, ngoId }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = async (notificationId: string) => {
    if (["1", "2", "3", "4"].includes(notificationId)) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ read: true }),
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };
  const loadNotifications = async () => {
    if (!userId && !ngoId) return;

    setLoading(true);
    try {
      const endpoint = userId
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/users/${userId}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/ngos/${ngoId}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.warn("Backend nicht erreichbar, verwende Mock-Daten");
        const mockNotifications: Notification[] = [
          {
            id: "1",
            userId: userId,
            name: "Willkommen bei Happy2Help!",
            description:
              "Dein Account wurde erfolgreich erstellt. Entdecke spannende Projekte.",
            read: false,
          },
          {
            id: "2",
            userId: userId,
            name: "Neue Projektanfrage",
            description: "Ein NGO hat Interesse an deinen Skills gezeigt.",
            read: false,
          },
          {
            id: "3",
            userId: userId,
            name: "Projekt aktualisiert",
            description:
              "Das Projekt 'Umweltschutz Hamburg' wurde aktualisiert.",
            read: true,
          },
          {
            id: "4",
            userId: userId,
            name: "Florian ist viel zu schlau",
            description: "Das Projekt 'Backend Auth' wurde aktualisiert.",
            read: false,
          },
        ];
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      const mockNotifications: Notification[] = [
        {
          id: "1",
          userId: userId,
          name: "Willkommen bei Happy2Help!",
          description:
            "Dein Account wurde erfolgreich erstellt. Entdecke spannende Projekte.",
          read: false,
        },
        {
          id: "2",
          userId: userId,
          name: "Neue Projektanfrage",
          description: "Ein NGO hat Interesse an deinen Skills gezeigt.",
          read: false,
        },
      ];
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId, ngoId]);

  useEffect(() => {
    if (!userId && !ngoId) return;
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [userId, ngoId]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 lg:p-2.5 rounded-full hover:bg-gray-100/60 transition-all duration-200">
          <Bell size={20} strokeWidth={2} className="text-prussian/70" />

          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-xl"
        side="bottom"
        align="center"
      >
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-prussian">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-light-mint hover:text-mint transition-colors duration-200 font-medium"
              >
                Alle als gelesen markieren
              </button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-prussian/60">Laden...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-prussian/60">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Benachrichtigungen</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/30">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer ${
                    !notification.read ? "bg-light-mint/10" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.read ? (
                        <CheckCircle2 size={16} className="text-gray-400" />
                      ) : (
                        <Dot size={20} className="text-light-mint" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-medium ${
                          notification.read
                            ? "text-prussian/70"
                            : "text-prussian"
                        }`}
                      >
                        {notification.name}
                      </h4>
                      <p
                        className={`text-xs mt-1 ${
                          notification.read
                            ? "text-prussian/50"
                            : "text-prussian/70"
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
          <div className="p-3 border-t border-gray-200/50 bg-gray-50/30">
            <button className="w-full text-center text-xs text-prussian/70 hover:text-prussian transition-colors duration-200">
              Alle Benachrichtigungen anzeigen
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
