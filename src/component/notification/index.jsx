import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { HubConnectionBuilder } from "@microsoft/signalr";

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function Notification({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:7288/notificationHub", {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        async function startConnection() {
            try {
                await newConnection.start();
                console.log("Connected to SignalR");

                newConnection.on("ReceiveNotification", (notification) => {
                    console.log("New notification received:", notification);
                    if (notification.type === NotificationType.NewFollower) {
                        // Xử lý thông báo người theo dõi mới
                        const newNotification = {
                            ...notification,
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                </svg>
                            )
                        };
                        setNotifications(prev => [newNotification, ...prev]);
                    } else {
                        setNotifications(prev => [notification, ...prev]);
                    }
                });
            } catch (err) {
                console.error("SignalR Connection Error:", err);
                setTimeout(startConnection, 5000);
            }
        }

        startConnection();

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get(`Notification?page=${page}&pageSize=10`);
            setNotifications(prev => [...prev, ...response.data]);
            setHasMore(response.data.length > 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const markAsRead = async (notificationId) => {
        try {
            await api.post(`Notification/${notificationId}/mark-read`);
            setNotifications(prev =>
                prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post(`Notification/mark-all-read`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-hidden mt-6">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                    Thông báo {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="text-sm text-blue-600">
                            ({notifications.filter(n => !n.isRead).length})
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-3">
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[60vh]">
                {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                        Không có thông báo nào
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                                    !notification.isRead ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Notification Icon - Thay đổi icon dựa trên loại thông báo */}
                                    <div className="flex-shrink-0 mt-1">
                                        {notification.type === "NEW_FOLLOWER" ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm text-gray-900 ${!notification.isRead ? 'font-medium' : ''}`}>
                                            {notification.content}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={() => markAsRead(notification.notificationId)}
                                                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    Đánh dấu đã đọc
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                    <div className="px-4 py-3 border-t border-gray-100">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 
                                     disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải...
                                </span>
                            ) : (
                                'Xem thêm'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notification;
