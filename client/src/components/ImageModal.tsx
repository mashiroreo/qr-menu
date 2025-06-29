import React from 'react';
import { createPortal } from 'react-dom';
import './ImageModal.css';

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, alt, onClose }) => {
  // モーダルの外側をクリックした時に閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESCキーで閉じる
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const modal = (
    <div className="image-modal-backdrop" onClick={handleBackdropClick}>
      <div className="image-modal-content">
        <button className="image-modal-close" onClick={onClose} aria-label="閉じる">
          ×
        </button>
        <img src={imageUrl} alt={alt} className="image-modal-img" />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ImageModal; 