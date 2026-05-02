import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        skeletons.push(
          <div key={i} className="skeleton-card">
            <div className="skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-line-sm"></div>
              <div className="skeleton-line-lg"></div>
            </div>
          </div>
        );
      } else if (type === 'table-row') {
        skeletons.push(
          <div key={i} className="skeleton-table-row">
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
          </div>
        );
      }
    }
    return skeletons;
  };

  return <div className={`skeleton-container skeleton-${type}`}>{renderSkeletons()}</div>;
};

export default SkeletonLoader;
