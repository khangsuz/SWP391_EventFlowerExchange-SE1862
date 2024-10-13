import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const notifySuccess = (message) => {
    toast.success(message);
};

const notifyError = (message) => {
    toast.error(message);
};

const Notification = () => {
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </>
    );
};

export { Notification, notifySuccess, notifyError };