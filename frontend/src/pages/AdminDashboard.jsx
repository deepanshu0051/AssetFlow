import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Factory } from 'lucide-react';
import api from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import SkeletonLoader from '../components/SkeletonLoader';
const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const plantName = user?.plantLocation || 'Your Plant';

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats([
          { title: 'Plant Machines', value: (res.data?.totalMachines || 0).toString(), icon: Cpu, color: '#2563eb' }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMachines = async () => {
    try {
      setLoadingData(true);
      const res = await api.getMachines();
      if (res.success) {
        setMachines(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch machines');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMachines();
  }, [plantName]);

  const columns = [
    { key: 'machineName', header: 'Machine Name' },
    { key: 'serialNumber', header: 'Serial Number' },
    { key: 'plantName', header: 'Plant' },
    { 
      key: 'cost', 
      header: 'Cost',
      render: (item) => `₹${item.cost?.toLocaleString() || 0}`
    },
    { 
      key: 'purchaseDate', 
      header: 'Purchase Date',
      render: (item) => item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'
    },
  ];

  return (
    <div className="dashboard-page premium-dashboard">
      <Header title={
        <div className="admin-header-content">
          <Factory size={20} className="premium-icon" />
          <h2 className="header-title-text">
            {plantName} Dashboard
          </h2>
        </div>
      } />
      
      <div className="stats-grid">
        {loadingStats ? (
          <SkeletonLoader type="card" count={1} />
        ) : (
          stats.map((stat, idx) => (
            <Card key={idx} {...stat} variant="premium" />
          ))
        )}
      </div>

      <div className="recent-activity section">
        <div className="section-header">
          <h3 className="section-title">Your Plant Machines</h3>
        </div>
        
        {loadingData ? (
          <SkeletonLoader type="table-row" count={5} />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <DataTable columns={columns} data={machines} emptyMessage="No machines in your plant yet" />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
