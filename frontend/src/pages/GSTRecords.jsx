import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import api from '../services/api';
import { useSearch } from '../context/SearchContext';

const GSTRecords = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useSearch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getMachines();
        if (response.success) {
          setMachines(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch GST records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGST = machines.filter(m => 
    (m.machineName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.plantName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGst = filteredGST.reduce((acc, m) => acc + (m.gstAmount || 0), 0);

  const columns = [
    { key: 'machineName', header: 'Machine Name', sortable: true },
    { key: 'plantName', header: 'Plant Name', sortable: true },

    { 
      key: 'cost', 
      header: 'Cost',
      sortable: true,
      render: (item) => `₹${(item.cost || 0).toLocaleString()}`
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
      render: (item) => `₹${(item.gstAmount || 0).toLocaleString()}`
    },
    { 
      key: 'purchaseDate', 
      header: 'Purchase Date',
      sortable: true,
      render: (item) => new Date(item.purchaseDate).toLocaleDateString()
    },
  ];

  return (
    <div className="gst-records-page">
      <Header title="GST Records" />
      
      <div className="section card" style={{ marginBottom: '24px' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total GST Credit (Automatic)</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              ₹{totalGst.toLocaleString()}
            </h2>
          </div>
          
          <div className="flex gap-4 items-center">
            <button className="btn btn-primary">Download Report</button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center" style={{ height: '200px' }}>
          <p>Loading records...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center" style={{ height: '200px', color: 'var(--text-muted)' }}>
          <p>{error}</p>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredGST} 
          emptyMessage="No GST Records Found"
          emptyIllustration={true}
        />
      )}
    </div>
  );
};

export default GSTRecords;
