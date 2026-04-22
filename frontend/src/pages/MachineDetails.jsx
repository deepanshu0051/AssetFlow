import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Cpu, Calendar, ShieldCheck, MapPin, Tag, Landmark } from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import './MachineDetails.css';

const MachineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        setLoading(true);
        const response = await api.getMachine(id);
        if (response.success) {
          setMachine(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch machine details');
      } finally {
        setLoading(false);
      }
    };
    fetchMachine();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        const response = await api.deleteMachine(id);
        if (response.success) {
          alert('Machine deleted successfully');
          navigate('/machines');
        }
      } catch (err) {
        alert(err.message || 'Failed to delete machine');
      }
    }
  };

  if (loading) return <div className="p-8 text-main">Loading machine details...</div>;
  if (error) return <div className="p-8 text-danger">{error}</div>;
  if (!machine) return <div className="p-8 text-main">Machine not found.</div>;

  const detailGroups = [
    {
      title: 'General Information',
      items: [
        { icon: Cpu, label: 'Machine Name', value: machine.machineName },
        { icon: Tag, label: 'Serial Number', value: machine.serialNumber },

        { icon: MapPin, label: 'Plant Name', value: machine.plantName || 'N/A' },
      ]
    },
    {
      title: 'Commercial Details',
      items: [
        { icon: Calendar, label: 'Purchase Date', value: new Date(machine.purchaseDate).toLocaleDateString() },
        { icon: Landmark, label: 'Cost (Excl. GST)', value: `₹${(machine.cost || 0).toLocaleString()}` },
        { icon: Tag, label: 'GST Percentage', value: `${machine.gstPercentage}%` },
        { icon: Landmark, label: 'GST Amount', value: `₹${(machine.gstAmount || 0).toLocaleString()}` },
        { icon: Landmark, label: 'Total Cost', value: `₹${((machine.cost || 0) + (machine.gstAmount || 0)).toLocaleString()}` },
      ]
    }
  ];

  return (
    <div className="machine-details-page">
      <Header title="Machine Details" />
      
      <div className="page-header mb-6">
        <button className="back-btn flex items-center gap-2" onClick={() => navigate('/machines')}>
          <ArrowLeft size={18} />
          <span>Back to Machines</span>
        </button>
        
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={() => navigate(`/machines/edit/${id}`)}><Edit size={18} /> Edit</button>
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={18} /> Delete</button>
        </div>
      </div>
      
      <div className="details-container">
        <div className="main-info card mb-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="machine-avatar">
                <Cpu size={32} />
              </div>
              <div>
                <h2 className="machine-name">{machine.machineName}</h2>
                <p className="machine-sn">ID: {machine.serialNumber}</p>
              </div>
            </div>
            <StatusBadge status={machine.status} />
          </div>
        </div>
        
        <div className="details-grid">
          {detailGroups.map((group, gIdx) => (
            <div key={gIdx} className="card">
              <h3 className="group-title">{group.title}</h3>
              <div className="details-list">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="detail-item">
                    <div className="item-icon">
                      <item.icon size={18} />
                    </div>
                    <div className="item-content">
                      <span className="item-label">{item.label}</span>
                      <span className="item-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="card full-width">
            <h3 className="group-title">Description</h3>
            <p className="notes-text">{machine.description || 'No additional description provided for this machine.'}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MachineDetails;
