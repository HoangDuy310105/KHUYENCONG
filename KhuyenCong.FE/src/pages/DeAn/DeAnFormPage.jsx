import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Calendar, Coins, Users, Save, X, FolderOpen, Send } from 'lucide-react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import confetti from 'canvas-confetti';
import './DeAn.css';

function DeAnFormPage() {
  const { showAlert, showConfirm } = useDialog();
  const navigate = useNavigate();
  const { id } = useParams();
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

  // BUG-03 FIX: Lưu thông tin file cũ khi đang trong chế độ Sửa
  const [fileDinhKemInfo, setFileDinhKemInfo] = useState(null);

  // Địa điểm: 3 cấp hành chính
  
  useEffect(() => {
    if (id) {
      const fetchDeAn = async () => {
        try {
          const res = await api.get('/dean/' + id);
          const data = res.data.data || res.data;
          setFormData(prev => ({
            ...prev,
            tenDeAn: data.tenDeAn || '',
            loaiDeAnId: data.loaiDeAnId || '',
            linhVucId: data.linhVucId || '',
            donViThuHuongId: data.donViThuHuongId || '',
            donViThiCongId: data.donViThiCongId || '',
            thoiGianBatDau: data.thoiGianBatDau ? data.thoiGianBatDau.split('T')[0] : '',
            thoiGianKetThuc: data.thoiGianKetThuc ? data.thoiGianKetThuc.split('T')[0] : '',
            kinhPhiDuKien: data.kinhPhiDuKien || '',
            kinhPhiThucHien: data.kinhPhiThucHien || '',
            donViThiCongText: data.hoSoDinhKem?.donViThiCong || '',
            donViGiamSat: data.hoSoDinhKem?.donViGiamSat || '',
            thoiGianGiamSat: data.hoSoDinhKem?.thoiGianGiamSat ? data.hoSoDinhKem.thoiGianGiamSat.split('T')[0] : '',
            diaDiemThucHien: data.hoSoDinhKem?.diaDiemThucHien || '',
            thoiGianNghiemThu: data.hoSoDinhKem?.thoiGianNghiemThu ? data.hoSoDinhKem.thoiGianNghiemThu.split('T')[0] : '',
            nguonKinhPhi: data.hoSoDinhKem?.nguonKinhPhi || ''
          }));
          if (data.hoSoDinhKem?.fileHoSo) {
            setFileDinhKemInfo(data.hoSoDinhKem.fileHoSo);
          }
          if (data.hoSoDinhKem?.diaDiemThucHien) {
            const parts = data.hoSoDinhKem.diaDiemThucHien.split(' - ');
            if (parts.length >= 3) {
              setDiaChiState({ selectedTinh: parts[2], selectedHuyen: parts[1], selectedXa: parts[0] });
            }
          }
        } catch (error) {
          console.error("Lỗi khi tải đề án:", error);
        }
      };
      fetchDeAn();
    }
  }, [id]);

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
    let finalValue = value;
    if (name === 'kinhPhiDuKien' || name === 'kinhPhiThucHien') {
      finalValue = value.replace(/\D/g, ''); // Xóa tất cả các ký tự không phải là số
    }
    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue };
      
      // Tự động đồng bộ NGUỒN KINH PHÍ khi chọn LOẠI ĐỀ ÁN
      if (name === 'loaiDeAnId') {
        const selectedLoai = danhMucs.loaiDeAns.find(l => l.id === finalValue);
        if (selectedLoai && selectedLoai.tenLoai) {
          const tenLoaiLower = selectedLoai.tenLoai.toLowerCase();
          if (tenLoaiLower.includes('địa phương')) {
            newData.nguonKinhPhi = 'Ngân sách Địa phương';
          } else if (tenLoaiLower.includes('quốc gia') || tenLoaiLower.includes('trung ương')) {
            newData.nguonKinhPhi = 'Ngân sách Trung ương';
          }
        }
      }
      return newData;
    });
  };

  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      fileHoSo: file
    }));
  };

  const handleSubmit = async (e, actionType = 'save') => {
    e.preventDefault();
    
    // --- Bổ sung Validation chi tiết ---
    if (!formData.tenDeAn || formData.tenDeAn.trim() === '') {
      showAlert('Lỗi', 'Vui lòng nhập Tên đề án.', 'warning');
      return;
    }
    if (!formData.loaiDeAnId) {
      showAlert('Lỗi', 'Vui lòng chọn Loại đề án.', 'warning');
      return;
    }
    if (!formData.linhVucId) {
      showAlert('Lỗi', 'Vui lòng chọn Lĩnh vực thực hiện.', 'warning');
      return;
    }
    if ((!diaChiState.selectedTinh || !diaChiState.selectedHuyen || !diaChiState.selectedXa) && !formData.diaDiemThucHien) {
      showAlert('Lỗi', 'Vui lòng chọn đầy đủ 3 cấp hành chính cho Địa điểm thực hiện (Tỉnh - Huyện - Xã).', 'warning');
      return;
    }
    if (!formData.donViThuHuongId) {
      showAlert('Lỗi', 'Vui lòng chọn Đơn vị thụ hưởng.', 'warning');
      return;
    }
    if (formData.kinhPhiDuKien === '' || Number(formData.kinhPhiDuKien) <= 0) {
      showAlert('Lỗi', 'Kinh phí dự kiến phải là số lớn hơn 0.', 'warning');
      return;
    }
    if (!formData.thoiGianBatDau || !formData.thoiGianKetThuc) {
      showAlert('Lỗi', 'Vui lòng chọn đầy đủ Thời gian thực hiện (Bắt đầu và Kết thúc).', 'warning');
      return;
    }
    if (new Date(formData.thoiGianBatDau) > new Date(formData.thoiGianKetThuc)) {
      showAlert('Lỗi', 'Cú pháp sai: Thời gian bắt đầu không được lớn hơn Thời gian kết thúc.', 'warning');
      return;
    }
    
    // UX FIX: Validation 20/05 ngay tại Frontend để tránh chờ upload file
    if (!id) {
      const today = new Date();
      if (today.getMonth() + 1 > 5 || (today.getMonth() + 1 === 5 && today.getDate() > 20)) {
        const isOk = await showConfirm('Hết hạn', `Đã quá thời hạn nộp hồ sơ (Hạn cuối: 20/05/${today.getFullYear()}). Hệ thống hiện đang chạy ở chế độ Demo, bạn có muốn tiếp tục nộp không?`, 'warning');
        if (!isOk) return;
      }
    }
    // -----------------------------------

    try {
      setUploading(true);
      let fileDinhKemInfoLocal = null;

      // Xử lý upload file thật lên Server
      if (formData.fileHoSo) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.fileHoSo);
        
        const uploadRes = await api.post('/file/upload', formDataUpload);
        fileDinhKemInfoLocal = uploadRes.data;
      } else if (id) {
        // BUG-03 FIX: Nếu đang sửa và không chọn file mới, giữ lại file cũ đã load từ API
        fileDinhKemInfoLocal = fileDinhKemInfo; // lấy từ state
      }

      // Bắt đầu Geocoding lấy tọa độ thực tế của Đề án
      const tenTinh = diaChiState.tinhList.find(t => String(t.code) === diaChiState.selectedTinh)?.name || '';
      const tenHuyen = diaChiState.huyenList.find(h => String(h.code) === diaChiState.selectedHuyen)?.name || '';
      const tenXa = diaChiState.xaList.find(x => String(x.code) === diaChiState.selectedXa)?.name || '';

      let viDo = null;
      let kinhDo = null;
      try {
        const fetchGeo = async (query) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            return await geoRes.json();
          } catch (e) {
            clearTimeout(timeoutId);
            return null;
          }
        };
        let geoData = await fetchGeo(`${tenXa}, ${tenHuyen}, ${tenTinh}, Việt Nam`);
        if (!geoData || geoData.length === 0) geoData = await fetchGeo(`${tenHuyen}, ${tenTinh}, Việt Nam`);
        if (!geoData || geoData.length === 0) geoData = await fetchGeo(`${tenTinh}, Việt Nam`);

        if (geoData && geoData.length > 0) {
          viDo = parseFloat(geoData[0].lat);
          kinhDo = parseFloat(geoData[0].lon);
        }
      } catch (geoErr) {
        console.warn("Geocoding failed for DeAn.", geoErr);
      }

      // Parse NguonKinhPhi to integer
      let nkpInt = 2; // Default Địa phương
      if (formData.nguonKinhPhi === 'Ngân sách Trung ương') nkpInt = 1;
      else if (formData.nguonKinhPhi === 'Ngân sách Địa phương') nkpInt = 2;
      else if (formData.nguonKinhPhi === 'Ngân sách Kết hợp') nkpInt = 3;
      else nkpInt = 4; // Khác

      const payload = {
        tenDeAn: formData.tenDeAn,
        linhVucId: formData.linhVucId,
        loaiDeAnId: formData.loaiDeAnId,
        donViThuHuongId: formData.donViThuHuongId,
        donViThiCongId: formData.donViThiCongId || null,
        kinhPhiDuKien: Number(formData.kinhPhiDuKien),
        nguonKinhPhi: nkpInt,
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
          fileHoSo: fileDinhKemInfoLocal, // Lưu thông tin file đã upload
          viDo: viDo,
          kinhDo: kinhDo
        }
      };

      let currentId = id;
      if (id) { 
        await api.put('/dean/' + id, payload); 
      } else { 
        const res = await api.post('/dean', payload);
        currentId = res.data?.id || res.data?.data?.id || res.data?.Id || res.data?.data?.Id;
      }

      if (actionType === 'save_and_submit' && currentId) {
        try {
          await api.post(`/dean/${currentId}/nop`);
          showAlert('Thành công', 'Hồ sơ đã được lưu và Nộp trình duyệt thành công!', 'success');
        } catch (err) {
          showAlert('Cảnh báo', 'Lưu thành công nhưng lỗi khi nộp: ' + (err.response?.data?.Message || err.message), 'warning');
        }
      } else {
        showAlert('Thành công', id ? 'Cập nhật đề án thành công!' : 'Tạo mới đề án thành công!', 'success');
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      navigate('/de-an');
    } catch (error) {
      console.error('Lỗi khi lưu đề án:', error);
      showAlert('Lỗi', 'Có lỗi xảy ra khi lưu đề án: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dean-modal-overlay">
      <div className="dean-modal-card">
        {/* Modal Header */}
        <div className="dean-modal-header">
          <div className="header-title-wrapper">
            <FolderOpen size={20} className="header-icon" />
            <h2>{id ? 'Cập nhật Đề án Khuyến công' : 'Lập hồ sơ Đề án Khuyến công'}</h2>
          </div>
          <button className="close-btn" onClick={() => navigate('/de-an')}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="dean-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            
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
                      className="readonly-input"
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
                    type="text" 
                    name="kinhPhiDuKien" 
                    value={formData.kinhPhiDuKien ? new Intl.NumberFormat('en-US').format(formData.kinhPhiDuKien) : ''} 
                    onChange={handleChange} 
                    required 
                    placeholder="0"
                    className="number-input"
                  />
                </div>
                <div className="form-group">
                  <label>KINH PHÍ THỰC HIỆN (VNĐ)</label>
                  <input 
                    type="text" 
                    name="kinhPhiThucHien" 
                    value={formData.kinhPhiThucHien ? new Intl.NumberFormat('en-US').format(formData.kinhPhiThucHien) : ''} 
                    onChange={handleChange} 
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
                  <label>HỒ SƠ ĐỀ ÁN (PDF, DOCX, ZIP) (*)</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      id="bienBanFile"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      required
                    />
                    <label htmlFor="bienBanFile" className="file-input-label">
                      Chọn File...
                    </label>
                    <span className="file-name-display">
                      {formData.fileHoSo ? formData.fileHoSo.name : 'Chưa có file đính kèm'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="form-footer">
              <span className="footnote">(*) Trường bắt buộc - Hồ sơ lưu theo quy trình TT28</span>
              <div className="footer-actions">
                <button type="button" className="btn-cancel" onClick={() => navigate('/de-an')} disabled={uploading}>
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn-action-primary" 
                  onClick={(e) => handleSubmit(e, 'save')} 
                  disabled={uploading}
                  style={{ backgroundColor: '#64748b', padding: '10px 20px', borderRadius: '6px', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Save size={16} style={{ marginRight: '6px' }} />
                  {uploading ? 'ĐANG LƯU...' : 'LƯU NHÁP'}
                </button>
                {(userRole === '1' || userRole === 'Role_CoSo') && (
                  <button 
                    type="button" 
                    className="btn-submit" 
                    onClick={(e) => handleSubmit(e, 'save_and_submit')} 
                    disabled={uploading}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Send size={16} style={{ marginRight: '6px' }} />
                    {uploading ? 'ĐANG XỬ LÝ...' : 'LƯU & NỘP HỒ SƠ'}
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default DeAnFormPage;
