import React, { useState, useEffect } from 'react';
import { Cpu, Factory } from 'lucide-react';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const plantName = user?.plantLocation || 'Your Plant';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const machinesRes = await api.getMachines();

        if (machinesRes.success) {
          const machineList = machinesRes.data;
          setMachines(machineList);

          setStats([
            { title: 'Plant Machines', value: machineList.length.toString(), icon: Cpu, color: '#2563eb' },
            { title: 'Plant', value: plantName, icon: Factory, color: '#10b981' },
          ]);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      render: (item) => new Date(item.purchaseDate).toLocaleDateString()
    },
  ];

  return (
    <div className="dashboard-page">
      <Header title={`${plantName} Dashboard`} />
      
      <div className="stats-grid">
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          stats.map((stat, idx) => (
            <Card key={idx} {...stat} />
          ))
        )}
      </div>

      <div className="recent-activity section">
        <div className="section-header">
          <h3 className="section-title">Your Plant Machines</h3>
        </div>
        {loading ? (
          <p>Loading machines...</p>
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
