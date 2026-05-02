import React from 'react';
import './Card.css';

const Card = ({ title, value, icon: Icon, trend, trendValue, color, variant = 'standard' }) => {
  return (
    <div className={`summary-card ${variant}-card`}>
      <div className="card-header">
        <div className="card-info">
          <p className="card-title">{title}</p>
          <h3 className="card-value">{value}</h3>
        </div>
        {Icon && (
          <div className="card-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {trend && (
        <div className="card-footer">
          <span className={`trend ${trend}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}%
          </span>
          <span className="trend-text"> vs last month</span>
        </div>
      )}
    </div>
  );
};

export default Card;
