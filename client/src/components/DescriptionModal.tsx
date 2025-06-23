import React from 'react';
import './DescriptionModal.css';

interface DescriptionModalProps {
  description?: string;
  title: string;
  price: number;
  onClose: () => void;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({ description, title, price, onClose }) => {
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
          <p style={{ fontWeight: 700, margin: '0 0 6px' }}>{price.toLocaleString()}円</p>
          <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '4px 0 6px' }} />
          {description && <p style={{ margin: 0 }}>{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal; 