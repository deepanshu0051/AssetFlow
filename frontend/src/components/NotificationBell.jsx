import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info } from 'lucide-react';
import apiService from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const [requests, setRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchRequests = async () => {
    try {
      const res = await apiService.getMachineRequests();
      if (res.success) {
        // Only show pending requests in the notification bell
        setRequests(res.data.filter(req => req.status === 'pending'));
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await apiService.approveMachineRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return; // Cancelled

    setLoading(true);
    try {
      await apiService.rejectMachineRequest(id, { rejectedReason: reason });
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <div 
        className={`bell-icon-container ${requests.length > 0 ? 'has-notifications' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={20} />
        {requests.length > 0 && (
          <span className="notification-count">{requests.length}</span>
        )}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Machine Requests</h3>
            {requests.length > 0 && <span className="pending-label">Pending</span>}
          </div>
          
          <div className="notification-list">
            {requests.length === 0 ? (
              <div className="no-notifications">
                <Info size={24} />
                <p>No pending requests</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req._id} className="notification-item">
                  <div className="notification-info">
                    <p className="req-machine-name">{req.machineName}</p>
                    <p className="req-details">
                      By: <strong>{req.admin?.name}</strong> | Plant: <strong>{req.plantName}</strong>
                    </p>
                    <p className="req-serial">S/N: {req.serialNumber}</p>
                  </div>
                  <div className="notification-actions">
                    <button 
                      className="btn-approve" 
                      onClick={() => handleApprove(req._id)}
                      disabled={loading}
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => handleReject(req._id)}
                      disabled={loading}
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
