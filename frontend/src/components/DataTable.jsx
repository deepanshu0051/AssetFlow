import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import './DataTable.css';

const DataTable = ({ columns, data, emptyMessage = "No records found.", emptyIllustration = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState(null);

  // Handle Sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Deep value extraction if key is nested (e.g. object field formatting handled earlier)
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Handle Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="table-wrapper">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={() => col.sortable ? requestSort(col.key) : null}
                  className={col.sortable ? 'sortable-header' : ''}
                >
                  <div className="header-content flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className="sort-icon">
                        {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                    {col.sortable && sortConfig?.key !== col.key && (
                      <span className="sort-icon inactive">
                        <ChevronUp size={14} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-row p-8 text-center border-b">
                  <div className="flex flex-col items-center justify-center py-12 text-muted">
                    {emptyIllustration ? (
                      <SearchX size={48} className="mb-4 text-gray-400 opacity-50" />
                    ) : null}
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    <p className="text-sm mt-1 opacity-70">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="pagination-controls flex justify-between items-center mt-4 px-2 text-sm">
          <div className="rows-per-page flex items-center gap-2">
            <span className="text-muted">Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={handleRowsPerPageChange}
              className="select-limit bg-card border-color px-2 py-1 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="page-navigation flex items-center gap-4">
            <span className="text-muted">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, sortedData.length)} of {sortedData.length} records
            </span>
            <div className="btn-group flex gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-btn p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage >= totalPages}
                className="page-btn p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
