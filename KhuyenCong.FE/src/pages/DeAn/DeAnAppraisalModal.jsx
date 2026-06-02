import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Upload, AlertCircle } from 'lucide-react';
import './DeAnAppraisalModal.css';

const DeAnAppraisalModal = ({ isOpen, onClose, item, onApprove, onReject, onRequireEdit }) => {
  const [appraisalType, setAppraisalType] = useState('phong');
  const [officerName, setOfficerName] = useState('');
  const [decisionNumber, setDecisionNumber] = useState('');
  const [councilMembers, setCouncilMembers] = useState('');
  const [checklist, setChecklist] = useState(Array(7).fill(false));
  const [comments, setComments] = useState('');
  const [fileAttached, setFileAttached] = useState(false);

  if (!isOpen || !item) return null;

  const criteriaPhong = [
    "Hồ sơ đầy đủ thành phần, bản vẽ, báo giá theo quy định.",
    "Đối tượng thụ hưởng hợp lệ (DNNVV, HTX, Tổ hợp tác, Hộ KD).",
    "Ngành nghề phù hợp danh mục khuyến khích và quy hoạch địa phương.",
    "Mục tiêu, quy mô và tính khả thi của đề án đạt yêu cầu thực tiễn.",
    "Cơ sở chứng minh được năng lực tài chính, đảm bảo vốn đối ứng.",
    "Dự toán kinh phí xin hỗ trợ bám sát định mức (Thông tư 28/2018).",
    "Đề án đảm bảo hiệu quả tạo việc làm, tăng thu nhập, bảo vệ môi trường."
  ];

  const criteriaHoiDong = [
    "1. Đánh giá hồ sơ năng lực của Đơn vị thực hiện và Chủ đầu tư.",
    "2. Thẩm định chi tiết sơ đồ công nghệ, quy trình sản xuất đề xuất.",
    "3. Thẩm định báo giá máy móc thiết bị (phải có ít nhất 3 báo giá cạnh tranh).",
    "4. Tính khả thi của phương án tài chính và hiệu quả hoàn vốn.",
    "5. Đánh giá tác động môi trường và giải pháp xử lý chất thải.",
    "6. Sự phù hợp với chiến lược phát triển công nghiệp của Tỉnh.",
    "7. Sự đồng thuận của các Sở ban ngành liên quan (Tài nguyên, KHĐT...).",
    "8. Đánh giá rủi ro và khả năng nhân rộng mô hình."
  ];

  const criteria = appraisalType === 'phong' ? criteriaPhong : criteriaHoiDong;

  const handleTypeChange = (type) => {
    setAppraisalType(type);
    setChecklist(Array(type === 'phong' ? criteriaPhong.length : criteriaHoiDong.length).fill(false));
  };

  const handleCheck = (index) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
  };

  const isAllPassed = checklist.every(Boolean);
  const isValidAppraisalInfo = appraisalType === 'phong' 
    ? officerName.trim().length > 0 
    : (decisionNumber.trim().length > 0 && councilMembers.trim().length > 0);
  
  const canApprove = isAllPassed && isValidAppraisalInfo && fileAttached;
  const hasFailedCriteria = checklist.some(x => x === false) || !fileAttached;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileAttached(true);
    }
  };

  const handleApproveSubmit = () => {
    if (!canApprove) return;
    onApprove(item);
  };

  return (
    <div className="appraisal-modal-overlay" onClick={onClose}>
      <div className="appraisal-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="appraisal-modal-header">
          <div>
            <h2>Phiếu Thẩm Định Điện Tử (Cấp Cơ Sở)</h2>
            <p>Đề án: <strong>{item.tenDeAn}</strong></p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="appraisal-modal-body">
          {/* Phân vùng 1: Khai báo pháp lý */}
          <div className="appraisal-section">
            <h3 className="section-title">1. Khai báo Căn cứ Pháp lý (Đơn vị thẩm định)</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="appraisalType" 
                  value="phong" 
                  checked={appraisalType === 'phong'} 
                  onChange={() => handleTypeChange('phong')} 
                />
                Phòng Quản lý Công nghiệp
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="appraisalType" 
                  value="hoidong" 
                  checked={appraisalType === 'hoidong'} 
                  onChange={() => handleTypeChange('hoidong')} 
                />
                Hội đồng thẩm định cấp cơ sở
              </label>
            </div>

            <div className="dynamic-inputs">
              {appraisalType === 'phong' && (
                <div className="input-group">
                  <label>Người chủ trì / Trưởng phòng phê duyệt (*):</label>
                  <input 
                    type="text" 
                    placeholder="Nhập họ tên cán bộ thụ lý..."
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                  />
                </div>
              )}
              {appraisalType === 'hoidong' && (
                <div className="input-group-row">
                  <div className="input-group">
                    <label>Số Quyết định thành lập (*):</label>
                    <input 
                      type="text" 
                      placeholder="VD: 123/QĐ-SCT"
                      value={decisionNumber}
                      onChange={(e) => setDecisionNumber(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Thành viên Hội đồng (*):</label>
                    <input 
                      type="text" 
                      placeholder="Chủ tịch HĐ, các ủy viên..."
                      value={councilMembers}
                      onChange={(e) => setCouncilMembers(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="file-upload-box">
              <label>Bản Scan Biên bản thẩm định (Bắt buộc) (*):</label>
              <div className="file-input-wrapper">
                <Upload size={16} />
                <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                <span className={fileAttached ? "text-success" : "text-muted"}>
                  {fileAttached ? "Đã đính kèm Biên bản" : "Chưa chọn file"}
                </span>
              </div>
            </div>
          </div>

          {/* Phân vùng 2: Checklist */}
          <div className="appraisal-section">
            <h3 className="section-title">2. Số hóa Bộ Tiêu chí Đánh giá (Checklist)</h3>
            <p className="section-desc">Cán bộ đối chiếu Biên bản thực tế và tick chọn ĐẠT cho các tiêu chí dưới đây.</p>
            <div className="checklist-container">
              {criteria.map((c, i) => (
                <div className={`checklist-item ${checklist[i] ? 'passed' : ''}`} key={i} onClick={() => handleCheck(i)}>
                  <div className="check-icon">
                    {checklist[i] ? <CheckCircle size={18} className="text-green-600" /> : <div className="circle-empty"></div>}
                  </div>
                  <span className="check-text">{c}</span>
                  <div className="check-status">
                    {checklist[i] ? <span className="badge-pass">ĐẠT</span> : <span className="badge-fail">CHƯA ĐẠT</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phân vùng 3: Quyết định */}
          <div className="appraisal-section">
            <h3 className="section-title">3. Kết luận Thẩm định</h3>
            <textarea 
              className="comments-box" 
              placeholder="Nhập nhận xét chung, ý kiến của hội đồng (nếu có)..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>
            
            {!canApprove && (
              <div className="warning-banner">
                <AlertCircle size={16} />
                <span>Bạn chưa hoàn thiện thông tin pháp lý hoặc chưa Check đủ {criteria.length} tiêu chí ĐẠT. Không thể Trình Bộ!</span>
              </div>
            )}
          </div>
        </div>

        <div className="appraisal-modal-footer">
          <div className="footer-left">
            <button className="btn-reject" onClick={() => onReject(item)}>
              <XCircle size={16} /> Từ chối hồ sơ
            </button>
            <button className="btn-require-edit" onClick={() => onRequireEdit(item)}>
              Yêu cầu sửa đổi
            </button>
          </div>
          <div className="footer-right">
            <button className="btn-cancel" onClick={onClose}>Đóng</button>
            <button 
              className={`btn-approve ${canApprove ? 'active' : 'disabled'}`}
              onClick={handleApproveSubmit}
              disabled={!canApprove}
            >
              <CheckCircle size={16} /> TRÌNH BỘ CÔNG THƯƠNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeAnAppraisalModal;
