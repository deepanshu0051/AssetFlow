import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle, Package, TrendingUp, ShoppingBag } from 'lucide-react';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Header from '../components/Header';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.getMachines();

        if (response.success) {
          const machines = response.data;

          // Process Stats
          const totalMachines = machines.length;
          const installedMachines = machines.filter(m => m.status === 'Installed').length;
          const inStockMachines = machines.filter(m => m.status === 'In Stock').length;

          setStats([
            { title: 'Total Machines', value: totalMachines.toString(), icon: Cpu, trend: 'up', trendValue: 0, color: '#2563eb' },
            { title: 'Installed Machines', value: installedMachines.toString(), icon: CheckCircle, trend: 'up', trendValue: 0, color: '#10b981' },
            { title: 'Machines In Stock', value: inStockMachines.toString(), icon: Package, trend: 'down', trendValue: 0, color: '#0ea5e9' },
          ]);

          // Process Recent Activity (Last 5 updated machines)
          const recent = [...machines]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map(m => ({
              id: m._id,
              machine: m.machineName,
              action: m.status,
              date: new Date(m.updatedAt).toLocaleDateString(),
              plant: m.plantName
            }));

          setRecentActivity(recent);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const columns = [
    { key: 'machine', header: 'Machine Name' },
    { 
      key: 'action', 
      header: 'Status',
      render: (item) => <StatusBadge status={item.action} />
    },
    { key: 'date', header: 'Date' },
    { 
      key: 'plant', 
      header: 'Location',
      render: (item) => item.plant || 'N/A'
    },
  ];

  return (
    <div className="dashboard-page">
      <Header title="Dashboard" />
      
      <div className="stats-grid">
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          stats.map((stat, idx) => (
            <Card key={idx} {...stat} />
          ))
        )}
      </div>
      
      <div className="recent-activity section" style={{ marginTop: '32px' }}>
        <div className="section-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">Recent Activity</h3>
          <button className="view-all-link" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>View All</button>
        </div>
        {loading ? (
          <p>Loading recent activity...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <DataTable columns={columns} data={recentActivity} />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
