import React, { useState } from 'react';
import { Users, Cpu, Factory, ShieldCheck, Eye, Trash2, X, AlertTriangle } from 'lucide-react';
import DataTable from '../components/DataTable';
import Header from '../components/Header';
import SkeletonLoader from '../components/SkeletonLoader';
import { useSearch } from '../context/SearchContext';
import api from '../services/api';
import './SuperAdminDashboard.css';

const PLANTS = ['Noida', 'Delhi', 'Mumbai', 'Greater Noida'];

const SuperAdminDashboard = () => {
  const [plantsData, setPlantsData] = useState([]);
  const [activePlant, setActivePlant] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [error, setError] = useState(null);
  
  const [viewMachine, setViewMachine] = useState(null);
  const [deleteMachineId, setDeleteMachineId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const { searchTerm } = useSearch();

  // Fetch plants on mount
  React.useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoadingPlants(true);
        const res = await api.getPlants();
        if (res.success) {
          setPlantsData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch plants:', err);
      } finally {
        setLoadingPlants(false);
      }
    };
    fetchPlants();
  }, []);

  const fetchMachinesForPlant = async (plantName) => {
    if (activePlant === plantName) return; // Already viewing
    setActivePlant(plantName);
    setError(null);
    try {
      setLoadingData(true);
      const res = await api.getMachines({ plant: plantName });
      if (res.success) {
        setMachines(res.data);
      }
    } catch (err) {
      setError(err.message || `Failed to fetch machines for ${plantName}`);
      setMachines([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteMachine = async () => {
    if (!deleteMachineId) return;
    try {
      setDeleting(true);
      const res = await api.deleteMachine(deleteMachineId);
      if (res.success) {
        setMachines(prev => prev.filter(m => m._id !== deleteMachineId));
        setDeleteMachineId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete machine');
    } finally {
      setDeleting(false);
    }
  };

  // Plant card themes based on Design #5
  const getPlantTheme = (name) => {
    const themes = {
      'Noida': 'theme-blue',
      'Delhi': 'theme-green',
      'Mumbai': 'theme-purple',
      'Greater Noida': 'theme-orange'
    };
    return themes[name] || 'theme-gray';
  };

  const filteredMachines = searchTerm 
    ? machines.filter(m => 
        m.machineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : machines;

  // Columns and DetailRow stay the same...
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
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="table-actions-row">
          <button 
            onClick={() => setViewMachine(item)}
            className="action-icon-btn action-view"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => setDeleteMachineId(item._id)}
            className="action-icon-btn action-delete"
            title="Delete Machine"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const DetailRow = ({ label, value }) => (
    <div className="flex items-start md:items-center border-b border-gray-800/50 py-3 text-sm">
      <span className="text-gray-500 font-medium w-40 shrink-0">{label}:</span>
      <span className="text-white font-medium flex-1">{value}</span>
    </div>
  );

  return (
    <div className="super-admin-dashboard premium-dashboard min-h-screen">
      <Header title={
        <div className="premium-header-content">
          <ShieldCheck size={22} className="premium-icon" />
          <span>Super Admin Control Panel</span>
          <span className="super-admin-badge">Super Admin</span>
        </div>
      } />
      
      <div className="px-8 pt-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Plants</h2>
        
        {loadingPlants ? (
          <div className="plants-grid">
            {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} type="card" />)}
          </div>
        ) : (
          <div className="plants-grid">
            {plantsData.map((plant) => {
              const isActive = activePlant === plant.plantName;
              return (
                <div 
                  key={plant.plantName}
                  onClick={() => fetchMachinesForPlant(plant.plantName)}
                  className={`plant-compact-card ${getPlantTheme(plant.plantName)} ${isActive ? 'active' : ''}`}
                >
                  <div className="compact-card-body">
                    <div className="compact-card-left">
                      <div className="compact-icon-box">
                        <Factory size={20} />
                      </div>
                      <div className="compact-name-group">
                        <h3 className="compact-plant-name">{plant.plantName}</h3>
                        <p className="compact-view-text">View Machines</p>
                      </div>
                    </div>
                    
                    <div className="compact-stats-group">
                      <div className="compact-stats-label">Machines</div>
                      <div className="compact-stats-value">{plant.machineCount}</div>
                    </div>
                  </div>
                  
                  <div className="compact-card-action">
                    <div className="compact-arrow-btn">
                      <Eye size={16} />
                    </div>
                  </div>
                  
                  {/* Decorative silhouette background */}
                  <div className="card-silhouette"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-content section px-8 max-w-7xl mx-auto mt-8">
        {!activePlant && (
          <div className="select-plant-placeholder">
            <Factory size={64} className="placeholder-icon" />
            <h3 className="placeholder-title">Select a Plant</h3>
            <p className="placeholder-desc">Click on any plant card above to instantly view and manage its machines.</p>
          </div>
        )}

        {activePlant && (
          <>
            <div className="section-header flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu size={20} className="text-indigo-400" />
                Machines in {activePlant}
              </h3>
            </div>

            {error ? (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400">
                {error}
              </div>
            ) : (
              <div className="tables-container">
                {loadingData ? (
                  <SkeletonLoader type="table-row" count={5} />
                ) : (
                  <div className="table-wrapper p-0">
                    <DataTable 
                      columns={machineColumns} 
                      data={filteredMachines} 
                      emptyMessage={`No machines found in ${activePlant}`}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal - Centered Popup */}
      {deleteMachineId && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <div className="delete-modal-body">
              <div className="delete-modal-icon-wrap">
                <AlertTriangle size={32} />
              </div>
              
              <div className="delete-modal-badge">
                <span>Super Admin Action</span>
              </div>
              
              <h3 className="delete-modal-title">Confirm Deletion</h3>
              
              <p className="delete-modal-desc">
                You are about to delete this machine. The Admin who added it will be automatically notified.
                <span className="delete-modal-warn">This action will move the record to history tracking.</span>
              </p>
              
              <div className="delete-modal-actions">
                <button 
                  onClick={() => setDeleteMachineId(null)} 
                  className="dm-btn dm-btn-cancel"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteMachine} 
                  className="dm-btn dm-btn-delete"
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="dm-spinner"></span>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Machine Details Modal */}
      {viewMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-0 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800/60 bg-[#252538]">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <Eye size={20} className="text-indigo-400" /> Machine Details
              </h3>
              <button onClick={() => setViewMachine(null)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-1">
                <DetailRow label="Machine Name" value={viewMachine.machineName} />
                <DetailRow label="Serial Number" value={viewMachine.serialNumber} />
                <DetailRow label="Plant" value={viewMachine.plantName} />
                <DetailRow label="Total Cost" value={`₹${viewMachine.cost?.toLocaleString()}`} />
                <DetailRow label="Purchase Date" value={new Date(viewMachine.purchaseDate).toLocaleDateString()} />
                <DetailRow label="GST Included" value={`${viewMachine.gstPercentage}%`} />
                <DetailRow label="Description" value={viewMachine.description || 'N/A'} />
              </div>

              <div className="mt-8 border border-indigo-500/20 bg-indigo-500/5 p-5 rounded-xl">
                <h4 className="text-indigo-400 text-sm font-semibold mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Users size={16} /> Created By
                </h4>
                <div className="space-y-1">
                  <DetailRow label="Admin Name" value={viewMachine.createdBy?.name || 'Unknown Admin'} />
                  <DetailRow label="Admin Email" value={viewMachine.createdBy?.email || 'N/A'} />
                  <DetailRow label="Mobile Number" value={viewMachine.createdBy?.mobileNumber || 'N/A'} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800/60 bg-[#252538] flex justify-end">
              <button 
                onClick={() => setViewMachine(null)} 
                className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
