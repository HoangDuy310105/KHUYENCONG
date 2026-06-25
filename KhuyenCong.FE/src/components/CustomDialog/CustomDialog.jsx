import { Info } from 'lucide-react';
import './CustomDialog.css';

export default function CustomDialog({ isOpen, title, message, type = 'info', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="custom-dialog-overlay animate-backdrop" style={{ zIndex: 11000 }}>
      <div className="custom-dialog-modal animate-popup">
        <div className="custom-dialog-body-center">
          <div className="custom-dialog-icon-wrapper">
            <div className="custom-dialog-icon-circle">
              <Info size={40} strokeWidth={2.5} color="#eab308" />
            </div>
          </div>
          <h3 className="custom-dialog-title-center">{title}</h3>
          <p className="custom-dialog-message-center">{message}</p>
          {type === 'prompt' && (
            <input 
              type="text" 
              id="dialog-prompt-input" 
              className="custom-dialog-input"
              style={{ width: '100%', marginTop: '16px', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              autoFocus 
            />
          )}
        </div>
        
        <div className="custom-dialog-footer-full">
          {(type === 'alert' || type === 'info') ? (
            <button onClick={onConfirm} className="custom-dialog-btn btn-red-full">
              Đóng
            </button>
          ) : (
            <div className="custom-dialog-btn-group">
              <button onClick={onCancel} className="custom-dialog-btn btn-grey-half">Hủy</button>
              <button onClick={() => {
                if (type === 'prompt') {
                  const val = document.getElementById('dialog-prompt-input')?.value || '';
                  onConfirm(val);
                } else {
                  onConfirm();
                }
              }} className="custom-dialog-btn btn-red-half">Xác nhận</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
