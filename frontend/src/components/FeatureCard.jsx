import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const FeatureCard = ({ icon: Icon, title, description, actionText, actionLink }) => {
  return (
    <div className="card">
      <div className="card-top">
        <div className="card-icon-container">
          <Icon size={24} />
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
      <div>
        <Link to={actionLink} className="card-action">
          <span>{actionText}</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default FeatureCard;
