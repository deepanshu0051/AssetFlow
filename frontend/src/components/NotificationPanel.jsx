import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import apiService from '../services/api';
import { useNotification } from '../context/NotificationContext';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const { isPanelOpen, closePanel } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleApprove = async (notificationId, requestId) => {
    setLoading(true);
    try {
      await apiService.approveMachineRequest(requestId);
      await apiService.markNotificationRead(notificationId);
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (notification) => {
    setActiveNotification(notification);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setActiveNotification(null);
    setRejectionReason('');
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      await apiService.rejectMachineRequest(activeNotification._id, { rejectedReason: rejectionReason });
      await apiService.markNotificationRead(activeNotification._id);
      fetchNotifications();
      closeRejectModal();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isPanelOpen) return null;

  return (
    <div className={`notification-side-panel ${isPanelOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <div className="header-title-row">
          <Bell size={20} className="panel-bell" />
          <h3>Notifications</h3>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount} New</span>}
        </div>
        <button className="panel-close-btn" onClick={closePanel}>
          <X size={20} />
        </button>
      </div>

      <div className="panel-content custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="empty-notifications-panel">
            <div className="empty-icon-wrapper-panel">
              <Bell size={48} />
            </div>
            <p>No notifications yet</p>
            <span>We'll notify you when something happens</span>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification._id} className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}>
              <div className="card-info">
                <p className="card-title">{notification.title}</p>
                <p className="card-message">{notification.message}</p>

                {notification.type === 'machine_request' && notification.data && (
                  <div className="panel-metadata-card">
                    {Object.entries({
                      'Machine Name': notification.data.machineName,
                      'Serial Number': notification.data.serialNumber,
                      'Plant Name': notification.data.plantName,
                      'Cost': `₹${notification.data.cost}`,
                      'Admin Name': notification.data.adminName,
                      'Mobile': notification.data.adminMobile,
                    }).map(([label, value]) => (
                      <div key={label} className="metadata-row">
                        <span className="metadata-label">{label}:</span>
                        <span className="metadata-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(notification.type === 'request_approved' || notification.type === 'request_rejected') && notification.data && (
                  <div className="feedback-metadata-panel">
                    {notification.data.superAdminName && (
                      <div className="metadata-row">
                        <span className="metadata-label">Processed By:</span>
                        <span className="metadata-value admin-tag">{notification.data.superAdminName}</span>
                      </div>
                    )}
                    {notification.type === 'request_rejected' && notification.data.rejectionReason && (
                      <div className="rejection-box-panel">
                        <p className="metadata-label">Reason:</p>
                        <p className="rejection-text-panel">{notification.data.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}

                <span className="card-time">
                  {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {notification.type === 'machine_request' && !notification.isRead && (
                <div className="panel-card-actions">
                  <button className="btn-panel-accept" onClick={() => handleApprove(notification._id, notification._id)} disabled={loading}>
                    <Check size={14} /> Accept
                  </button>
                  <button className="btn-panel-reject" onClick={() => openRejectModal(notification)} disabled={loading}>
                    <X size={14} /> Reject
                  </button>
                </div>
              )}

              {!notification.isRead && notification.type !== 'machine_request' && (
                <button className="panel-mark-read" onClick={() => handleMarkAsRead(notification._id)}>
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showRejectModal && (
        <div className="modal-overlay-panel">
          <div className="modal-content-panel">
            <div className="modal-header-panel">
              <h3>Reject Request</h3>
              <p>Rejection for: {activeNotification?.data?.machineName}</p>
            </div>
            <div className="modal-body-panel">
              <label>Rejection Reason <span className="required-star">*</span></label>
              <textarea 
                placeholder="Why is this request being rejected?" 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer-panel">
              <button className="btn-cancel-panel" onClick={closeRejectModal} disabled={loading}>Cancel</button>
              <button className="btn-confirm-panel" onClick={submitRejection} disabled={loading || !rejectionReason.trim()}>
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
