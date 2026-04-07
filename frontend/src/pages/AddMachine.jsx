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
  const [errors, setErrors] = useState({});
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

  const validateField = (name, value) => {
    let error = '';
    const trimmedValue = value ? value.toString().trim() : '';

    // Required check
    if (!trimmedValue && name !== 'description') {
      return 'This field is required';
    }

    // Text only validation (Letters and spaces)
    if (['machineName', 'plantName'].includes(name)) {
      if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
        error = 'Only letters are allowed';
      }
    }

    // Number validation
    if (name === 'cost') {
      if (!/^\d+(\.\d+)?$/.test(trimmedValue)) {
        error = 'Only numbers are allowed';
      } else if (parseFloat(trimmedValue) <= 0) {
        error = 'Cost must be a positive number';
      }
    }

    // Date validation (No future dates)
    if (name === 'purchaseDate') {
      const selectedDate = new Date(trimmedValue);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Allow today
      if (selectedDate > today) {
        error = 'Future date is not allowed';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update data
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear global error
    if (error) setError(null);

    // Validate field in real-time
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) {
        newErrors[key] = fieldError;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please correct the validation errors', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        machineName: formData.machineName.trim(),
        serialNumber: formData.serialNumber.trim(),
        plantName: formData.plantName.trim(),
        purchaseDate: formData.purchaseDate,
        cost: parseFloat(formData.cost),
        gstPercentage: parseInt(formData.gstPercentage),
        status: formData.status,
        description: (formData.description || '').trim()
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
              error={errors.machineName}
            />
            <FormInput
              label="Serial Number"
              name="serialNumber"
              placeholder="e.g. SN-2024-001"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              error={errors.serialNumber}
            />
            <FormInput
              label="Plant Name"
              name="plantName"
              placeholder="e.g. Delhi Industrial Plant"
              value={formData.plantName}
              onChange={handleChange}
              required
              error={errors.plantName}
            />

            <FormInput
              label="Purchase Date"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              error={errors.purchaseDate}
            />
            <FormInput
              label="Cost (Excl. GST)"
              name="cost"
              type="number"
              placeholder="Enter amount in INR"
              value={formData.cost}
              onChange={handleChange}
              required
              error={errors.cost}
            />
            <FormInput
              label="GST Percentage"
              name="gstPercentage"
              type="select"
              options={['5', '12', '18', '28']}
              value={formData.gstPercentage}
              onChange={handleChange}
              required
              error={errors.gstPercentage}
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              options={['In Stock', 'Installed']}
              value={formData.status}
              onChange={handleChange}
              required
              error={errors.status}
            />
            <div className="full-width">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                placeholder="Any specific description or requirements..."
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
              />
            </div>
          </div>

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
