import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AddMachine.css';

const AddMachine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    machineName: '',
    serialNumber: '',
    plantName: user?.plantLocation || '',
    purchaseDate: '',
    cost: '',
    gstPercentage: '18',
    description: ''
  });

  const isSuperAdmin = user?.role === 'superadmin';

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
    } else if (!isSuperAdmin && user?.plantLocation) {
        // Ensure Admin's plant is set
        setFormData(prev => ({ ...prev, plantName: user.plantLocation }));
    }
    if (isSuperAdmin) {
      const fetchPlants = async () => {
        try {
          const res = await api.getPlants();
          if (res.success) setPlants(res.data);
        } catch (err) {
          console.error("Failed to fetch plants");
        }
      };
      fetchPlants();
    }
  }, [id, isEdit, isSuperAdmin, user]);

  const validateField = (name, value) => {
    let error = '';
    const trimmedValue = value ? value.toString().trim() : '';

    if (!trimmedValue && name !== 'description') {
      return 'This field is required';
    }

    if (name === 'machineName') {
      if (!/^[a-zA-Z]+$/.test(trimmedValue)) {
        error = 'Only letters are allowed (no spaces or special characters)';
      }
    }

    if (name === 'serialNumber') {
      if (!/^[a-zA-Z0-9]+$/.test(trimmedValue)) {
        error = 'Only letters and numbers are allowed';
      }
    }

    if (name === 'cost') {
      if (!/^\d+(\.\d+)?$/.test(trimmedValue)) {
        error = 'Only numbers are allowed';
      } else if (parseFloat(trimmedValue) < 5000) {
        error = 'Minimum machine cost must be 5000';
      }
    }

    if (name === 'purchaseDate') {
      const selectedDate = new Date(trimmedValue);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        error = 'Future date is not allowed';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const hasErrors = Object.values(errors).some(err => err !== '');
  const isSubmitDisabled = loading || hasErrors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any mandatory field is empty
    const mandatoryFields = ['machineName', 'serialNumber', 'plantName', 'purchaseDate', 'cost'];
    const emptyFields = mandatoryFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      addToast('Please fill all details', 'error');
      // Highlight empty fields
      const newErrors = { ...errors };
      emptyFields.forEach(field => {
        newErrors[field] = 'This field is required';
      });
      setErrors(newErrors);
      return;
    }

    // Double check cost validation
    if (parseFloat(formData.cost) < 5000) {
      addToast('Minimum machine cost must be 5000', 'error');
      setErrors(prev => ({ ...prev, cost: 'Minimum machine cost must be 5000' }));
      return;
    }

    if (!validateForm()) {
      addToast('Please correct the validation errors', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        machineName: formData.machineName.trim(),
        serialNumber: formData.serialNumber.trim(),
        plantName: formData.plantName.trim(),
        purchaseDate: formData.purchaseDate,
        cost: parseFloat(formData.cost),
        gstPercentage: parseInt(formData.gstPercentage),
        description: (formData.description || '').trim()
      };

      let response;
      if (isEdit) {
        response = await api.updateMachine(id, payload);
      } else if (!isSuperAdmin) {
        // Admin sends request
        response = await api.createMachineRequest(payload);
      } else {
        // Super Admin saves directly
        response = await api.createMachine(payload);
      }
        
      if (response.success) {
        addToast(
          isEdit ? 'Machine updated successfully!' : 
          (!isSuperAdmin ? 'Request sent to Super Admin' : 'Machine added successfully!'), 
          'success'
        );
        navigate('/machines');
      }
    } catch (err) {
      addToast(err.message || 'Failed to save machine', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-machine-page">
      <Header title={isEdit ? 'Edit Machine' : 'Add New Machine'} />

      <div className="page-header">
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
              placeholder="e.g. LaserX"
              value={formData.machineName}
              onChange={handleChange}
              required
              error={errors.machineName}
              isValid={formData.machineName !== '' && /^[a-zA-Z]+$/.test(formData.machineName)}
            />
            <FormInput
              label="Serial Number"
              name="serialNumber"
              placeholder="e.g. SN2024001"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              error={errors.serialNumber}
              isValid={formData.serialNumber !== '' && /^[a-zA-Z0-9]+$/.test(formData.serialNumber)}
            />
            <FormInput
              label="Plant Name"
              name="plantName"
              type={isSuperAdmin ? 'select' : 'text'}
              options={isSuperAdmin ? (plants.length > 0 ? plants : ['Loading...']) : []}
              value={formData.plantName}
              onChange={handleChange}
              readOnly={!isSuperAdmin}
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

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/machines')} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled}>
              <Save size={18} />
              <span>{loading ? 'Processing...' : isEdit ? 'Update Machine' : (isSuperAdmin ? 'Save Machine' : 'Request Machine')}</span>
            </button>
          </div>
        </form>
      </div>


    </div>
  );
};

export default AddMachine;
