import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import './CustomDialog.css';

export default function CustomDialog({ isOpen, title, message, type = 'info', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="custom-dialog-overlay animate-backdrop" style={{ zIndex: 11000 }}>
      <div className="custom-dialog-modal animate-popup">
        <div className="custom-dialog-body-flex">
          <div className="custom-dialog-icon-col">
            <div className={`custom-dialog-icon-circle ${type === 'danger' || type === 'warning' ? 'bg-red' : 'bg-blue'}`}>
              {type === 'danger' || type === 'warning' ? <HelpCircle size={24} strokeWidth={2.5} /> : <Info size={24} strokeWidth={2.5} />}
            </div>
          </div>
          <div className="custom-dialog-content-col">
            <h3 className="custom-dialog-title">{title}</h3>
            <p className="custom-dialog-message">{message}</p>
            <div className="custom-dialog-footer">
              {type !== 'info' && type !== 'alert' && onCancel && (
                <button onClick={onCancel} className="custom-dialog-btn btn-text-cancel">Bỏ qua</button>
              )}
              <button onClick={onConfirm} className="custom-dialog-btn btn-red-confirm">
                {type === 'info' || type === 'alert' ? 'Đóng' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
