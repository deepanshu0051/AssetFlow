import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const AddMachine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    machineName: '',
    serialNumber: '',
    plantName: '',

    purchaseDate: '',
    cost: '',
    gstPercentage: '18',
    status: 'In Stock',
    description: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchMachine = async () => {
        try {
          setLoading(true);
          const response = await api.getMachine(id);
          if (response.success) {
            const m = response.data;
            setFormData({
              machineName: m.machineName,
              serialNumber: m.serialNumber,
              plantName: m.plantName,

              purchaseDate: new Date(m.purchaseDate).toISOString().split('T')[0],
              cost: m.cost.toString(),
              gstPercentage: m.gstPercentage.toString(),
              status: m.status,
              description: m.description || ''
            });
          }
        } catch (err) {
          setError('Failed to load machine data');
        } finally {
          setLoading(false);
        }
      };
      fetchMachine();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const machineName = formData.machineName.trim();
    const serialNumber = formData.serialNumber.trim();
    const plantName = formData.plantName.trim();
    const description = (formData.description || '').trim();

    if (!machineName || !serialNumber || !plantName || !formData.purchaseDate || !formData.cost || !formData.gstPercentage || !formData.status) {
      return setError('Please fill in all required fields');
    }

    if (isNaN(formData.cost) || parseFloat(formData.cost) <= 0) {
      return setError('Please enter a valid positive cost');
    }

    if (isNaN(formData.gstPercentage) || parseFloat(formData.gstPercentage) < 0) {
      return setError('Please enter a valid GST percentage');
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        ...formData,
        machineName,
        serialNumber,
        plantName,
        description,
        cost: parseFloat(formData.cost),
        gstPercentage: parseInt(formData.gstPercentage)
      };

      const response = isEdit 
        ? await api.updateMachine(id, payload)
        : await api.createMachine(payload);
        
      if (response.success) {
        addToast(`Machine ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        navigate('/machines');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save machine', 'error');
      setError(err.message || 'Failed to save machine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-machine-page">
      <Header title={isEdit ? 'Edit Machine' : 'Add New Machine'} />

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <button className="back-btn flex items-center gap-2" onClick={() => navigate('/machines')}>
          <ArrowLeft size={18} />
          <span>Back to Machines</span>
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput
              label="Machine Name"
              name="machineName"
              placeholder="e.g. Laser CNC X1"
              value={formData.machineName}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Serial Number"
              name="serialNumber"
              placeholder="e.g. SN-2024-001"
              value={formData.serialNumber}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Plant Name"
              name="plantName"
              placeholder="e.g. Delhi Industrial Plant"
              value={formData.plantName}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Purchase Date"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Cost (Excl. GST)"
              name="cost"
              type="number"
              placeholder="Enter amount in INR"
              value={formData.cost}
              onChange={handleChange}
              required
            />
            <FormInput
              label="GST Percentage"
              name="gstPercentage"
              type="select"
              options={['5', '12', '18', '28']}
              value={formData.gstPercentage}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              options={['In Stock', 'Installed']}
              value={formData.status}
              onChange={handleChange}
              required
            />
            <div className="full-width">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                placeholder="Any specific description or requirements..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
          <div className="form-actions flex justify-end gap-4" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/machines')} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Machine' : 'Save Machine'}</span>
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0 24px;
        }
        
        .full-width {
          grid-column: span 2;
        }
        
        .back-btn {
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .back-btn:hover {
          color: var(--primary);
        }
        
        .btn-secondary {
          background-color: #f1f5f9;
          color: var(--text-main);
        }
        
        .btn-secondary:hover {
          background-color: #e2e8f0;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}} />
    </div>
  );
};

export default AddMachine;
