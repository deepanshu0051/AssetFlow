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
  const [activePlant, setActivePlant] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  
  const [viewMachine, setViewMachine] = useState(null);
  const [deleteMachineId, setDeleteMachineId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const { searchTerm } = useSearch();

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

  const filteredMachines = searchTerm 
    ? machines.filter(m => 
        m.machineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : machines;

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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMachine(item)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => setDeleteMachineId(item._id)}
            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            title="Delete Machine"
          >
            <Trash2 size={18} />
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
      
      <div className="px-6 pt-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Plants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANTS.map(plant => {
            const isActive = activePlant === plant;
            return (
              <div 
                key={plant}
                onClick={() => fetchMachinesForPlant(plant)}
                className={`premium-card cursor-pointer transition-all duration-300 rounded-2xl border ${
                  isActive 
                    ? 'border-indigo-500 bg-[#24243e] shadow-[0_0_20px_rgba(99,102,241,0.15)] transform -translate-y-1' 
                    : 'border-gray-800 bg-[#1e1e2d] hover:border-gray-600 hover:-translate-y-1'
                } p-5`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl transition-colors duration-300 ${
                    isActive ? 'bg-indigo-600' : 'bg-gray-800 group-hover:bg-gray-700'
                  }`}>
                    <Factory size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plant}</h3>
                    <p className={`text-sm ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {isActive ? 'Currently Viewing' : 'View Machines'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-content section px-6 max-w-7xl mx-auto mt-8">
        {!activePlant && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-700 rounded-2xl bg-gray-900/30">
            <Factory size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Select a Plant</h3>
            <p className="text-gray-400">Click on any plant card above to instantly view and manage its machines.</p>
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

      {/* Delete Confirmation Modal */}
      {deleteMachineId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-500">
                <AlertTriangle size={20} /> Confirm Deletion
              </h3>
              <button onClick={() => setDeleteMachineId(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <p className="mb-6 text-gray-300 text-sm">
              Are you sure you want to permanently delete this machine? The Admin who added it will be automatically notified.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteMachineId(null)} 
                className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 text-sm font-medium transition-colors cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteMachine} 
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
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
