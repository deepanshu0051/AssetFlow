import React, { useState, useEffect } from 'react';
import { Users, Cpu, Factory, Search } from 'lucide-react';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Header from '../components/Header';
import api from '../services/api';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [allMachines, setAllMachines] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPlant, setSearchPlant] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [machinesRes, usersRes] = await Promise.all([
        api.getMachines(),
        api.getUsers()
      ]);

      if (machinesRes.success && usersRes.success) {
        const machines = machinesRes.data;
        const users = usersRes.data;

        setAllMachines(machines);
        setAllUsers(users);

        const uniquePlants = [...new Set(machines.map(m => m.plantName))].length;

        setStats([
          { title: 'Total Users', value: users.length.toString(), icon: Users, color: '#6366f1' },
          { title: 'Total Machines', value: machines.length.toString(), icon: Cpu, color: '#2563eb' },
          { title: 'Active Plants', value: uniquePlants.toString(), icon: Factory, color: '#10b981' },
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch super admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMachines = searchPlant 
    ? allMachines.filter(m => m.plantName.toLowerCase().includes(searchPlant.toLowerCase()))
    : allMachines;

  const machineColumns = [
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
    }
  ];

  const userColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'plantLocation', header: 'Plant Location' }
  ];

  return (
    <div className="super-admin-dashboard">
      <Header title="Super Admin Dashboard" />
      
      <div className="stats-grid">
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          stats.map((stat, idx) => (
            <Card key={idx} {...stat} />
          ))
        )}
      </div>

      <div className="dashboard-content section">
        <div className="section-header">
          <h3 className="section-title">Plant Search & Machine Overview</h3>
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by plant name..." 
              value={searchPlant}
              onChange={(e) => setSearchPlant(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="tables-container">
            <div className="table-wrapper">
              <h4>All Machines{searchPlant && ` - ${searchPlant} Plant`}</h4>
              <DataTable columns={machineColumns} data={filteredMachines} />
            </div>

            <div className="table-wrapper">
              <h4>All Users / Admins</h4>
              <DataTable columns={userColumns} data={allUsers} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
