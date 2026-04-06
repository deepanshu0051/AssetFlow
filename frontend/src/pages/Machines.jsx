import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useSearch } from '../context/SearchContext';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Machines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useSearch();
  const [statusFilter, setStatusFilter] = useState('All');
  const { addToast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await api.getMachines();
      if (response.success) {
        setMachines(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setMachineToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      const response = await api.deleteMachine(machineToDelete);
      if (response.success) {
        addToast('Machine deleted successfully', 'success');
        fetchMachines();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete machine', 'error');
    } finally {
      setDeleteModalOpen(false);
      setMachineToDelete(null);
    }
  };

  const filteredData = machines.filter(m => {
    const name = m.machineName || '';
    const serial = m.serialNumber || '';
    const plantName = m.plantName || '';
    const status = m.status || '';
    
    const term = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = name.toLowerCase().includes(term) || 
                          serial.toLowerCase().includes(term) ||
                          plantName.toLowerCase().includes(term) ||
                          status.toLowerCase().includes(term);
                          
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'machineName', header: 'Machine Name', sortable: true },

    { key: 'plantName', header: 'Plant Name', sortable: true },
    { key: 'serialNumber', header: 'Serial Number', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />
    },
    { 
      key: 'purchaseDate', 
      header: 'Purchase Date', 
      sortable: true,
      render: (item) => new Date(item.purchaseDate).toLocaleDateString()
    },
    { 
      key: 'cost', 
      header: 'Cost',
      sortable: true,
      render: (item) => `₹${item.cost?.toLocaleString() || 0}`
    },
    { 
      key: 'gstPercentage', 
      header: 'GST %',
      sortable: true,
      render: (item) => `${item.gstPercentage}%`
    },
    { 
      key: 'gstAmount', 
      header: 'GST Amount',
      sortable: true,
      render: (item) => `₹${item.gstAmount?.toLocaleString() || 0}`
    },
    { 
      key: 'actions', 
      header: 'Actions',
      width: '180px',
      render: (item) => (
        <div className="flex gap-2">
          <button className="action-btn view" onClick={() => navigate(`/machines/${item._id}`)}>View</button>
          <button className="action-btn edit" onClick={() => navigate(`/machines/edit/${item._id}`)}>Edit</button>
          <button className="action-btn delete" onClick={() => confirmDelete(item._id)}>Delete</button>
        </div>
      )
    },
  ];

  return (
    <div className="machines-page">
      <Header title="Machines" />
      
      <div className="page-actions flex justify-between items-center mb-6">
        <div className="filters flex gap-4">
          <select 
            className="form-control w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Installed">Installed</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={() => navigate('/machines/add')}>
          <Plus size={18} />
          <span>Add Machine</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading machines...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-muted">
          <p>{error}</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData} 
          emptyMessage="No Machines Found"
          emptyIllustration={true}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Machine"
        message="Are you sure you want to delete this machine? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMachineToDelete(null);
        }}
      />
    </div>
  );
};

export default Machines;
