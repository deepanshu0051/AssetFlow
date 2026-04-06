import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'in stock': return 'status-instock';
      case 'installed': return 'status-installed';
      case 'sold': return 'status-sold';
      case 'maintenance':
      case 'under maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
