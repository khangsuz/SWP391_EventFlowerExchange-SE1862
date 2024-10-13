import React, { useState, useEffect } from "react";
import api from "../../config/axios";

function Notification() {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`Notification`);
            console.log("Notifications response:", response.data);
            setNotifications(Array.isArray(response.data.notifications) ? response.data.notifications : []);
        } catch (error) {
            console.error("Error fetching notifications:", error.response?.data || error.message);
            setNotifications([]);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);
}

export default Notification;