import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useSearch } from '../context/SearchContext';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Machines = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useSearch();
  const [plantFilter, setPlantFilter] = useState('All');
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
        addToast('Machine moved to Deleted Machines', 'success');
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
    
    const term = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = name.toLowerCase().includes(term) || 
                          serial.toLowerCase().includes(term) ||
                          plantName.toLowerCase().includes(term);
                          
    const matchesPlant = plantFilter === 'All' || m.plantName === plantFilter;
    return matchesSearch && matchesPlant;
  });

  const columns = [
    { key: 'machineName', header: 'Machine Name', sortable: true },
    { key: 'plantName', header: 'Plant', sortable: true },
    { key: 'serialNumber', header: 'Serial Number', sortable: true },
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
      width: '120px',
      render: (item) => (
        <div className="flex gap-2">
          <button className="action-btn view" onClick={() => navigate(`/machines/${item._id}`)}>View</button>
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
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
          >
            <option value="All">All Plants</option>
            <option value="Noida">Noida</option>
            <option value="Delhi">Delhi</option>
            <option value="Greater Noida">Greater Noida</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={() => navigate('/machines/add')}>
          <Plus size={18} />
          <span>Add Machine</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-50">
          <p>Loading machines...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-50 text-muted">
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
        message="Are you sure you want to delete this machine? It will be moved to Deleted Machines."
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
