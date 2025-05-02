import React from 'react';
import './DescriptionModal.css';

interface DescriptionModalProps {
  description: string;
  title: string;
  onClose: () => void;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({ description, title, onClose }) => {
  return (
    <div className="description-modal-overlay" onClick={onClose}>
      <div className="description-modal-content" onClick={e => e.stopPropagation()}>
        <div className="description-modal-header">
          <h3>{title}</h3>
          <button className="description-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="description-modal-body" style={{ whiteSpace: 'pre-line' }}>
          {description}
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal; 