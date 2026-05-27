import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Coins, Users, Save, X, FolderOpen } from 'lucide-react';
import api from '../../services/api';
import './DeAn.css';

function DeAnFormPage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const userDonViId = localStorage.getItem('donViId');
  const userTenDonVi = localStorage.getItem('tenDonVi');

  const [formData, setFormData] = useState({
    tenDeAn: '',
    linhVucId: '',
    loaiDeAnId: '',
    donViThuHuongId: (userRole === '1' || userRole === 'Role_CoSo') ? (userDonViId || '') : '',
    donViThiCongId: '',
    kinhPhiDuKien: 0,
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
    
    // Extra fields for HoSoDinhKem JSONB
    diaDiemThucHien: '',
    thoiGianNghiemThu: '',
    kinhPhiThucHien: '',
    nguonKinhPhi: 'Ngân sách Trung ương',
    donViThiCongText: '',
    donViGiamSat: '',
    thoiGianGiamSat: '',
    bienBanGiamSatFile: null
  });

  const [danhMucs, setDanhMucs] = useState({
    linhVucs: [],
    loaiDeAns: [],
    donVis: []
  });

  // Địa điểm: 3 cấp hành chính
  const [diaChiState, setDiaChiState] = useState({
    tinhList: [],
    huyenList: [],
    xaList: [],
    selectedTinh: '',
    selectedHuyen: '',
    selectedXa: '',
    loadingHuyen: false,
    loadingXa: false,
  });

  useEffect(() => {
    // Tải danh mục cho dropdowns
    const fetchDanhMucs = async () => {
      try {
        const lvRes = await api.get('/linhvuc').catch(() => ({ data: [] }));
        const ldaRes = await api.get('/loaidean').catch(() => ({ data: [] }));
        const dvRes = await api.get('/donvi?page=1&pageSize=100').catch(() => ({ data: { items: [], data: [] } }));

        setDanhMucs({
          linhVucs: Array.isArray(lvRes.data) ? lvRes.data : [],
          loaiDeAns: Array.isArray(ldaRes.data) ? ldaRes.data : (ldaRes.data?.items || ldaRes.data?.data || []),
          donVis: Array.isArray(dvRes.data?.data) 
            ? dvRes.data.data 
            : (Array.isArray(dvRes.data?.items) 
              ? dvRes.data.items 
              : (Array.isArray(dvRes.data) ? dvRes.data : []))
        });
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      }
    };
    fetchDanhMucs();
  }, []);

  // Tải danh sách Tỉnh/TP khi mount
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(r => r.json())
      .then(data => setDiaChiState(prev => ({ ...prev, tinhList: data })))
      .catch(() => {});
  }, []);

  const handleTinhChange = async (e) => {
    const code = e.target.value;
    const ten = diaChiState.tinhList.find(t => String(t.code) === code)?.name || '';
    setDiaChiState(prev => ({
      ...prev, selectedTinh: code, selectedHuyen: '', selectedXa: '',
      huyenList: [], xaList: [], loadingHuyen: !!code
    }));
    updateDiaDiem(ten, '', '');
    if (!code) return;
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
      const data = await res.json();
      setDiaChiState(prev => ({
        ...prev, huyenList: data.districts || [], loadingHuyen: false
      }));
    } catch { setDiaChiState(prev => ({ ...prev, loadingHuyen: false })); }
  };

  const handleHuyenChange = async (e) => {
    const code = e.target.value;
    const tenTinh = diaChiState.tinhList.find(t => String(t.code) === diaChiState.selectedTinh)?.name || '';
    const tenHuyen = diaChiState.huyenList.find(h => String(h.code) === code)?.name || '';
    setDiaChiState(prev => ({
      ...prev, selectedHuyen: code, selectedXa: '',
      xaList: [], loadingXa: !!code
    }));
    updateDiaDiem(tenTinh, tenHuyen, '');
    if (!code) return;
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
      const data = await res.json();
      setDiaChiState(prev => ({
        ...prev, xaList: data.wards || [], loadingXa: false
      }));
    } catch { setDiaChiState(prev => ({ ...prev, loadingXa: false })); }
  };

  const handleXaChange = (e) => {
    const code = e.target.value;
    const tenTinh = diaChiState.tinhList.find(t => String(t.code) === diaChiState.selectedTinh)?.name || '';
    const tenHuyen = diaChiState.huyenList.find(h => String(h.code) === diaChiState.selectedHuyen)?.name || '';
    const tenXa = diaChiState.xaList.find(x => String(x.code) === code)?.name || '';
    setDiaChiState(prev => ({ ...prev, selectedXa: code }));
    updateDiaDiem(tenTinh, tenHuyen, tenXa);
  };

  const updateDiaDiem = (tinh, huyen, xa) => {
    const parts = [xa, huyen, tinh].filter(Boolean);
    setFormData(prev => ({ ...prev, diaDiemThucHien: parts.join(', ') }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      bienBanGiamSatFile: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tenDeAn: formData.tenDeAn,
        linhVucId: formData.linhVucId,
        loaiDeAnId: formData.loaiDeAnId,
        donViThuHuongId: formData.donViThuHuongId,
        donViThiCongId: formData.donViThiCongId || null,
        kinhPhiDuKien: Number(formData.kinhPhiDuKien),
        thoiGianBatDau: formData.thoiGianBatDau || null,
        thoiGianKetThuc: formData.thoiGianKetThuc || null,
        hoSoDinhKem: {
          diaDiemThucHien: formData.diaDiemThucHien,
          thoiGianNghiemThu: formData.thoiGianNghiemThu || null,
          kinhPhiThucHien: formData.kinhPhiThucHien ? Number(formData.kinhPhiThucHien) : 0,
          nguonKinhPhi: formData.nguonKinhPhi,
          donViThiCong: formData.donViThiCongText,
          donViGiamSat: formData.donViGiamSat,
          thoiGianGiamSat: formData.thoiGianGiamSat || null,
          bienBanGiamSat: formData.bienBanGiamSatFile ? formData.bienBanGiamSatFile.name : null
        }
      };

      await api.post('/dean', payload);
      alert('Khởi tạo đề án thành công!');
      navigate('/de-an');
    } catch (error) {
      console.error('Lỗi khi lưu đề án:', error);
      alert('Có lỗi xảy ra khi lưu đề án');
    }
  };

  return (
    <div className="dean-modal-overlay">
      <div className="dean-modal-card">
        {/* Modal Header */}
        <div className="dean-modal-header">
          <div className="header-title-wrapper">
            <FolderOpen size={20} className="header-icon" />
            <h2>Lập hồ sơ Đề án Khuyến công</h2>
          </div>
          <button className="close-btn" onClick={() => navigate('/de-an')}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="dean-modal-body">
          <form onSubmit={handleSubmit}>
            
            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
            <div className="form-section">
              <h3 className="section-title">
                <FileText size={16} className="title-icon" />
                ① THÔNG TIN CƠ BẢN
              </h3>
              
              <div className="form-group full-width">
                <label>TÊN ĐỀ ÁN (*)</label>
                <input 
                  type="text" 
                  name="tenDeAn" 
                  value={formData.tenDeAn} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập tên đề án..."
                />
              </div>

              <div className="form-grid grid-2">
                <div className="form-group">
                  <label>LOẠI ĐỀ ÁN (*)</label>
                  <select name="loaiDeAnId" value={formData.loaiDeAnId} onChange={handleChange} required>
                    <option value="">-- Chọn loại đề án --</option>
                    {danhMucs.loaiDeAns.map(item => (
                      <option key={item.id} value={item.id}>{item.tenLoai}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>LĨNH VỰC THỰC HIỆN (*)</label>
                  <select name="linhVucId" value={formData.linhVucId} onChange={handleChange} required>
                    <option value="">-- Chọn lĩnh vực --</option>
                    {danhMucs.linhVucs.map(item => (
                      <option key={item.id} value={item.id}>{item.tenLinhVuc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Địa điểm thực hiện - 3 cấp hành chính */}
              <div className="form-group full-width" style={{ marginBottom: 0 }}>
                <label>ĐỊA ĐIỂM THỰC HIỆN (*)</label>
                <div className="location-3col">
                  {/* Tỉnh / Thành phố */}
                  <select
                    value={diaChiState.selectedTinh}
                    onChange={handleTinhChange}
                    required
                    className="location-select"
                  >
                    <option value="">-- Tỉnh / Thành phố --</option>
                    {diaChiState.tinhList.map(t => (
                      <option key={t.code} value={t.code}>{t.name}</option>
                    ))}
                  </select>

                  {/* Quận / Huyện */}
                  <select
                    value={diaChiState.selectedHuyen}
                    onChange={handleHuyenChange}
                    disabled={!diaChiState.selectedTinh || diaChiState.loadingHuyen}
                    className="location-select"
                  >
                    <option value="">
                      {diaChiState.loadingHuyen ? 'Đang tải...' : '-- Quận / Huyện --'}
                    </option>
                    {diaChiState.huyenList.map(h => (
                      <option key={h.code} value={h.code}>{h.name}</option>
                    ))}
                  </select>

                  {/* Xã / Phường */}
                  <select
                    value={diaChiState.selectedXa}
                    onChange={handleXaChange}
                    disabled={!diaChiState.selectedHuyen || diaChiState.loadingXa}
                    className="location-select"
                  >
                    <option value="">
                      {diaChiState.loadingXa ? 'Đang tải...' : '-- Xã / Phường --'}
                    </option>
                    {diaChiState.xaList.map(x => (
                      <option key={x.code} value={x.code}>{x.name}</option>
                    ))}
                  </select>
                </div>
                {formData.diaDiemThucHien && (
                  <div className="location-preview">
                    📍 {formData.diaDiemThucHien}
                  </div>
                )}
              </div>

              <div className="form-grid grid-1" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label>ĐƠN VỊ THỤ HƯỞNG (*)</label>
                  {(userRole === '1' || userRole === 'Role_CoSo') ? (
                    <input 
                      type="text" 
                      value={userTenDonVi || 'Đơn vị của bạn'} 
                      readOnly 
                      disabled
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)', cursor: 'not-allowed' }}
                    />
                  ) : (
                    <select name="donViThuHuongId" value={formData.donViThuHuongId} onChange={handleChange} required>
                      <option value="">-- Chọn đơn vị --</option>
                      {danhMucs.donVis.filter(x => x.loaiDonVi === 1).map(item => (
                        <option key={item.id} value={item.id}>{item.tenDonVi}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: THỜI GIAN THỰC HIỆN */}
            <div className="form-section">
              <h3 className="section-title">
                <Calendar size={16} className="title-icon" />
                ② THỜI GIAN THỰC HIỆN
              </h3>
              <div className="form-grid grid-3">
                <div className="form-group">
                  <label>NGÀY BẮT ĐẦU (*)</label>
                  <input 
                    type="date" 
                    name="thoiGianBatDau" 
                    value={formData.thoiGianBatDau} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>NGÀY KẾT THÚC (*)</label>
                  <input 
                    type="date" 
                    name="thoiGianKetThuc" 
                    value={formData.thoiGianKetThuc} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>THỜI GIAN NGHIỆM THU (*)</label>
                  <input 
                    type="date" 
                    name="thoiGianNghiemThu" 
                    value={formData.thoiGianNghiemThu} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: KINH PHÍ */}
            <div className="form-section">
              <h3 className="section-title">
                <Coins size={16} className="title-icon" />
                ③ KINH PHÍ
              </h3>
              <div className="form-grid grid-3">
                <div className="form-group">
                  <label>KINH PHÍ DỰ KIẾN (VNĐ) (*)</label>
                  <input 
                    type="number" 
                    name="kinhPhiDuKien" 
                    value={formData.kinhPhiDuKien} 
                    onChange={handleChange} 
                    required 
                    min="0"
                    placeholder="0"
                    className="number-input"
                  />
                </div>
                <div className="form-group">
                  <label>KINH PHÍ THỰC HIỆN (VNĐ)</label>
                  <input 
                    type="number" 
                    name="kinhPhiThucHien" 
                    value={formData.kinhPhiThucHien} 
                    onChange={handleChange} 
                    min="0"
                    placeholder="Điền sau khi thực hiện"
                    className="number-input"
                  />
                </div>
                <div className="form-group">
                  <label>NGUỒN KINH PHÍ (*)</label>
                  <select name="nguonKinhPhi" value={formData.nguonKinhPhi} onChange={handleChange} required>
                    <option value="Ngân sách Trung ương">Ngân sách Trung ương</option>
                    <option value="Ngân sách Địa phương">Ngân sách Địa phương</option>
                    <option value="Đối ứng của doanh nghiệp">Đối ứng của doanh nghiệp</option>
                    <option value="Nguồn khác">Nguồn khác</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: CÁC ĐƠN VỊ LIÊN QUAN */}
            <div className="form-section">
              <h3 className="section-title">
                <Users size={16} className="title-icon" />
                ④ CÁC ĐƠN VỊ LIÊN QUAN
              </h3>
              <div className="form-grid grid-2">
                <div className="form-group">
                  <label>ĐƠN VỊ THI CÔNG (*)</label>
                  <input 
                    type="text" 
                    name="donViThiCongText" 
                    value={formData.donViThiCongText} 
                    onChange={handleChange} 
                    required 
                    placeholder="Tên đơn vị thi công đề án..."
                  />
                </div>
                <div className="form-group">
                  <label>ĐƠN VỊ GIÁM SÁT (*)</label>
                  <input 
                    type="text" 
                    name="donViGiamSat" 
                    value={formData.donViGiamSat} 
                    onChange={handleChange} 
                    required 
                    placeholder="Tên đơn vị giám sát..."
                  />
                </div>
              </div>

              <div className="form-grid grid-2">
                <div className="form-group">
                  <label>THỜI GIAN GIÁM SÁT/KIỂM TRA</label>
                  <input 
                    type="date" 
                    name="thoiGianGiamSat" 
                    value={formData.thoiGianGiamSat} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label>BIÊN BẢN GIÁM SÁT (FILE ĐÍNH KÈM)</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      id="bienBanFile"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="bienBanFile" className="file-input-label">
                      Choose File
                    </label>
                    <span className="file-name-display">
                      {formData.bienBanGiamSatFile ? formData.bienBanGiamSatFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="form-footer">
              <span className="footnote">(*) Trường bắt buộc - Hồ sơ lưu theo quy trình TT28</span>
              <div className="footer-actions">
                <button type="button" className="btn-cancel" onClick={() => navigate('/de-an')}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  <Save size={16} style={{ marginRight: '6px' }} />
                  LƯU HỒ SƠ
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default DeAnFormPage;
