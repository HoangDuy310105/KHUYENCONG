import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './DonViPage.css';
import { Plus, Search, Edit3, Trash2, X, MapPin, Building2, CheckCircle2, AlertCircle, Layers, Briefcase, Phone, Factory, ShieldCheck, AlertTriangle } from 'lucide-react';
import CustomDialog from '../../components/CustomDialog/CustomDialog';

function DonViPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // KPI states
  const [stats, setStats] = useState({ total: 0, thuHuong: 0, thiCong: 0, giamSat: 0 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Dialog states
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false, title: '', message: '', type: 'info', onConfirm: null
  });

  // Location APIs state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Form states
  const [soNha, setSoNha] = useState('');
  const [formData, setFormData] = useState({
    tenDonVi: '',
    maSoThue: '',
    loaiDonVi: 1, // 1: ThuHuong, 2: ThiCong, 3: GiamSat
    quyMo: 'DNNVV', // DNNVV, HTX, THT, HKD, DNLON
    diaChi: '',
    maTinh: '',
    maHuyen: '',
    maXa: '',
    soDienThoai: ''
  });

  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchData();
    fetchProvinces();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/donvi?page=1&pageSize=100');
      
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response.data && Array.isArray(response.data.Data)) {
        items = response.data.Data;
      } else if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      }
      
      setData(items);
      
      // Calculate stats
      let th = 0, tc = 0, gs = 0;
      items.forEach(i => {
        if (i.loaiDonVi === 1) th++;
        else if (i.loaiDonVi === 2) tc++;
        else if (i.loaiDonVi === 3) gs++;
      });
      setStats({ total: items.length, thuHuong: th, thiCong: tc, giamSat: gs });

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await res.json();
      setProvinces(data || []);
    } catch (e) {
      console.error('Lỗi tải danh mục Tỉnh:', e);
    }
  };

  const handleTinhChange = async (code) => {
    setFormData(prev => ({ ...prev, maTinh: code, maHuyen: '', maXa: '' }));
    setWards([]);
    if (!code) { setDistricts([]); return; }
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch (e) { console.error(e); }
  };

  const handleHuyenChange = async (code) => {
    setFormData(prev => ({ ...prev, maHuyen: code, maXa: '' }));
    if (!code) { setWards([]); return; }
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    } catch (e) { console.error(e); }
  };

  const openAddModal = () => {
    setEditingId(null);
    setSoNha('');
    setDistricts([]);
    setWards([]);
    setFormData({ tenDonVi: '', maSoThue: '', loaiDonVi: 1, quyMo: 'DNNVV', diaChi: '', maTinh: '', maHuyen: '', maXa: '', soDienThoai: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (item) => {
    setEditingId(item.id);
    setFormError(null);
    
    // Attempt to extract soNha from the front of diaChi
    let extractedSoNha = item.diaChi || '';
    if (item.diaChi && item.diaChi.includes(',')) {
      extractedSoNha = item.diaChi.split(',')[0];
    }
    setSoNha(extractedSoNha);

    setFormData({
      ...item,
      maTinh: item.maTinh || '',
      maHuyen: item.maHuyen || '',
      maXa: item.maXa || ''
    });
    
    setIsModalOpen(true);

    if (item.maTinh) {
      try {
        const resTinh = await fetch(`https://provinces.open-api.vn/api/p/${item.maTinh}?depth=2`);
        const dataTinh = await resTinh.json();
        setDistricts(dataTinh.districts || []);
      } catch (e) {}
    }
    if (item.maHuyen) {
      try {
        const resHuyen = await fetch(`https://provinces.open-api.vn/api/d/${item.maHuyen}?depth=2`);
        const dataHuyen = await resHuyen.json();
        setWards(dataHuyen.wards || []);
      } catch (e) {}
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // Validation Logic based on REAL API DATA
  const validateForm = () => {
    if (!formData.tenDonVi || !formData.maSoThue) {
      return { valid: false, message: 'Vui lòng nhập Tên đơn vị và Mã số thuế.', popup: false };
    }
    if (!formData.maTinh || !formData.maHuyen || !formData.maXa) {
      return { valid: false, message: 'Vui lòng chọn đầy đủ Tỉnh, Huyện, Xã.', popup: false };
    }

    // 1. Validate Loại hình
    if (formData.loaiDonVi === 1 && formData.quyMo === 'DNLON') {
      return { 
        valid: false, 
        message: 'Doanh nghiệp lớn không thuộc đối tượng Cơ sở công nghiệp nông thôn (chỉ gồm: DNNVV, HTX, Tổ hợp tác, Hộ kinh doanh). Không đủ điều kiện Thụ hưởng Khuyến công.',
        popup: false
      };
    }

    // 2. Validate Địa bàn based on division_type
    if (formData.loaiDonVi === 1) {
      const selHuyen = districts.find(d => String(d.code) === String(formData.maHuyen));
      if (selHuyen && selHuyen.division_type === 'quận') {
        return {
          valid: false,
          message: `Đơn vị nằm ở địa bàn ${selHuyen.name} (Khu vực nội thành) nên không đủ điều kiện tham gia với tư cách Đơn vị Thụ hưởng Khuyến công (theo Nghị định 45/2012/NĐ-CP).`,
          popup: true
        };
      }
    }

    return { valid: true };
  };

  const handleSave = async () => {
    const check = validateForm();
    if (!check.valid) {
      if (check.popup) {
        setDialogConfig({
          isOpen: true,
          title: 'Cảnh báo Địa lý (Không đủ điều kiện)',
          message: check.message,
          type: 'danger',
          onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
        });
      } else {
        setFormError(check.message);
      }
      return;
    }

    // Build the full address to save
    const selTinh = provinces.find(p => String(p.code) === String(formData.maTinh));
    const selHuyen = districts.find(d => String(d.code) === String(formData.maHuyen));
    const selXa = wards.find(w => String(w.code) === String(formData.maXa));

    let fullAddress = soNha ? `${soNha}, ` : '';
    if (selXa) fullAddress += `${selXa.name}, `;
    if (selHuyen) fullAddress += `${selHuyen.name}, `;
    if (selTinh) fullAddress += `${selTinh.name}`;

    const payload = {
      ...formData,
      diaChi: fullAddress,
      maTinh: String(formData.maTinh),
      maHuyen: String(formData.maHuyen),
      maXa: String(formData.maXa)
    };

    try {
      if (editingId) {
        await api.put(`/donvi/${editingId}`, payload);
      } else {
        await api.post('/donvi', payload);
      }
      closeModal();
      
      // Hiển thị thông báo thành công
      setDialogConfig({
        isOpen: true,
        title: 'Thành công',
        message: editingId ? 'Đã cập nhật thông tin Đơn vị thành công!' : 'Đã thêm mới Đơn vị thành công!',
        type: 'info',
        onConfirm: () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          fetchData();
        }
      });
      
    } catch (err) {
      setFormError('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.');
    }
  };

  const handleDelete = (id) => {
    setDialogConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa đơn vị này? Hành động này không thể hoàn tác.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.delete(`/donvi/${id}`);
          fetchData();
        } catch (err) {
          alert('Lỗi khi xóa đơn vị');
        } finally {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Rendering Helpers
  const renderLoaiDonVi = (type) => {
    switch(type) {
      case 1: return <span className="dv-badge thu-huong"><Briefcase size={12} /> Thụ hưởng</span>;
      case 2: return <span className="dv-badge thi-cong"><Factory size={12} /> Thi công</span>;
      case 3: return <span className="dv-badge giam-sat"><ShieldCheck size={12} /> Giám sát</span>;
      default: return <span className="dv-badge khac">Khác</span>;
    }
  };

  const renderQuyMo = (qm) => {
    switch(qm) {
      case 'DNNVV': return 'Doanh nghiệp Nhỏ & Vừa';
      case 'HTX': return 'Hợp tác xã';
      case 'THT': return 'Tổ hợp tác';
      case 'HKD': return 'Hộ kinh doanh';
      case 'DNLON': return 'Doanh nghiệp Lớn';
      default: return qm || '-';
    }
  };

  const renderStatus = (item) => {
    if (item.loaiDonVi === 1 && item.quyMo === 'DNLON') {
      return <span className="dv-valid-tag err" title="Quy mô không phù hợp">Không Hợp Lệ</span>;
    }
    const addr = (item.diaChi || '').toLowerCase();
    // Fallback if data was mocked earlier
    if (item.loaiDonVi === 1 && addr.includes('quận') && !item.maHuyen) {
      return <span className="dv-valid-tag err" title="Sai quy định địa bàn">Không Hợp Lệ</span>;
    }
    return <span className="dv-valid-tag ok"><CheckCircle2 size={10} style={{display:'inline', marginBottom:'-2px'}}/> Hợp lệ</span>;
  };

  // Filter Data
  const filteredData = data.filter(d => {
    const ten = d.tenDonVi || '';
    const matchSearch = ten.toLowerCase().includes(searchTerm.toLowerCase()) || (d.maSoThue && d.maSoThue.includes(searchTerm));
    const matchFilter = filterType === 'ALL' || d.loaiDonVi === parseInt(filterType);
    return matchSearch && matchFilter;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (p) => {
    if (p > 0 && p <= totalPages) setCurrentPage(p);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }
    const uniquePages = pages.filter((v, i, a) => a.indexOf(v) === i);

    return (
      <div className="dv-pagination">
        <button className="dv-page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>&lt;</button>
        {uniquePages.map((p, idx) => (
          <button 
            key={idx} 
            className={`dv-page-btn ${p === currentPage ? 'active' : ''}`}
            disabled={p === '...'}
            onClick={() => p !== '...' && handlePageChange(p)}
          >
            {p}
          </button>
        ))}
        <button className="dv-page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>&gt;</button>
      </div>
    );
  };

  return (
    <div className="dv-page">
      <div className="dv-header">
        <div>
          <h1 className="dv-page-title">Quản lý Đơn vị & Doanh nghiệp</h1>
          <p className="dv-page-subtitle">Kết nối dữ liệu Danh mục Địa giới Hành chính trực tiếp qua API</p>
        </div>
        <button className="dv-btn-add" onClick={openAddModal}>
          <Plus size={18} /> Thêm Đơn vị
        </button>
      </div>

      <div className="dv-kpi-grid">
        <div className="dv-kpi-card navy">
          <div className="dv-kpi-icon"><Building2 size={24} /></div>
          <div className="dv-kpi-body">
            <div className="dv-kpi-label">Tổng Đơn vị</div>
            <div className="dv-kpi-value">{stats.total}</div>
            <div className="dv-kpi-sub">Trong hệ thống CSDL</div>
          </div>
        </div>
        <div className="dv-kpi-card blue">
          <div className="dv-kpi-icon"><Briefcase size={24} /></div>
          <div className="dv-kpi-body">
            <div className="dv-kpi-label">Thụ hưởng</div>
            <div className="dv-kpi-value">{stats.thuHuong}</div>
            <div className="dv-kpi-sub">Cơ sở CNNT / HTX / HKD</div>
          </div>
        </div>
        <div className="dv-kpi-card orange">
          <div className="dv-kpi-icon"><Factory size={24} /></div>
          <div className="dv-kpi-body">
            <div className="dv-kpi-label">Thi công</div>
            <div className="dv-kpi-value">{stats.thiCong}</div>
            <div className="dv-kpi-sub">Nhà thầu / Đối tác</div>
          </div>
        </div>
        <div className="dv-kpi-card purple">
          <div className="dv-kpi-icon"><ShieldCheck size={24} /></div>
          <div className="dv-kpi-body">
            <div className="dv-kpi-label">Giám sát</div>
            <div className="dv-kpi-value">{stats.giamSat}</div>
            <div className="dv-kpi-sub">Cơ quan đánh giá</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 13, color: '#475569' }}>
        Tìm thấy <strong>{filteredData.length}</strong> kết quả
      </div>

      <div className="dv-panel">
        <div className="dv-list-header">
          <div className="dv-tabs">
            <button className={`dv-tab ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => { setFilterType('ALL'); setCurrentPage(1); }}>
              Tất cả ({stats.total})
            </button>
            <button className={`dv-tab ${filterType === '1' ? 'active' : ''}`} onClick={() => { setFilterType('1'); setCurrentPage(1); }}>
              Thụ hưởng ({stats.thuHuong})
            </button>
            <button className={`dv-tab ${filterType === '2' ? 'active' : ''}`} onClick={() => { setFilterType('2'); setCurrentPage(1); }}>
              Thi công ({stats.thiCong})
            </button>
            <button className={`dv-tab ${filterType === '3' ? 'active' : ''}`} onClick={() => { setFilterType('3'); setCurrentPage(1); }}>
              Giám sát ({stats.giamSat})
            </button>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="dv-search-box" style={{ width: '220px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px', background: '#fff' }}>
              <Search size={14} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Tên hoặc MST..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent' }}
              />
            </div>
            <span style={{fontSize: 13, color: '#475569'}}>Hiển thị {pageSize} bản ghi/ Trang</span>
            {renderPagination()}
          </div>
        </div>
        
        <div className="dv-card-list">
          {loading ? (
            <div style={{textAlign:'center', padding:'30px', color:'#64748b'}}>Đang tải dữ liệu...</div>
          ) : paginatedData.length === 0 ? (
            <div style={{textAlign:'center', padding:'30px', color:'#64748b'}}>Không tìm thấy dữ liệu phù hợp.</div>
          ) : (
            paginatedData.map((item, index) => (
              <div key={item.id} className="dv-card">
                <div className="dv-card-header">
                  <div className="dv-mst">MST: {item.maSoThue}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderStatus(item)}
                    {renderLoaiDonVi(item.loaiDonVi)}
                  </div>
                </div>
                
                <h3 className="dv-card-title">{item.tenDonVi}</h3>
                
                <div className="dv-meta-tags">
                  <span className="dv-tag" title="Quy mô">
                    <Layers size={14} color="#94a3b8" /> 
                    {renderQuyMo(item.quyMo) || 'Chưa cập nhật'}
                  </span>
                  <span className="dv-tag" title="Phân loại Đơn vị">
                    <Briefcase size={14} color="#94a3b8" /> 
                    {item.loaiDonVi === 1 ? 'Cơ sở CNNT / HTX' : item.loaiDonVi === 2 ? 'Nhà thầu thi công' : 'Đơn vị tư vấn'}
                  </span>
                  <span className="dv-tag" title="Số điện thoại">
                    <Phone size={14} color="#94a3b8" /> 
                    {item.soDienThoai || 'Chưa cập nhật'}
                  </span>
                </div>
                
                <div className="dv-address-line">
                  <MapPin size={16} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: '#475569', fontSize: 13, lineHeight: 1.5 }}>
                    <strong style={{ color: '#1e293b' }}>Địa chỉ:</strong> {item.diaChi || 'Chưa cập nhật'}
                  </span>
                </div>
                
                <div className="dv-card-footer">
                  <span style={{fontSize: 11, color: '#94a3b8', fontFamily: 'monospace'}}>ID: {item.id}</span>
                  <div className="dv-action-btns">
                    <button className="dv-btn-action edit" onClick={() => openEditModal(item)}>
                      <Edit3 size={14}/> Sửa
                    </button>
                    <button className="dv-btn-action delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14}/> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {paginatedData.length > 0 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
            {renderPagination()}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="dv-modal-overlay">
          <div className="dv-modal">
            <div className="dv-modal-header">
              <h2 className="dv-modal-title">{editingId ? 'Cập nhật Đơn vị' : 'Thêm mới Đơn vị'}</h2>
              <button className="dv-modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="dv-modal-body">
              {formError && (
                <div className="dv-err-banner">
                  <AlertTriangle size={18} />
                  <span>{formError}</span>
                </div>
              )}
              
              <div className="dv-form-group" style={{marginBottom: 16}}>
                <label className="dv-label">Phân loại Tham gia <span style={{color:'red'}}>*</span></label>
                <div className="dv-radio-group">
                  <label className={`dv-radio ${formData.loaiDonVi === 1 ? 'active' : ''}`}>
                    <input type="radio" checked={formData.loaiDonVi === 1} onChange={() => setFormData({...formData, loaiDonVi: 1})} />
                    Thụ hưởng
                  </label>
                  <label className={`dv-radio ${formData.loaiDonVi === 2 ? 'active' : ''}`}>
                    <input type="radio" checked={formData.loaiDonVi === 2} onChange={() => setFormData({...formData, loaiDonVi: 2})} />
                    Thi công
                  </label>
                  <label className={`dv-radio ${formData.loaiDonVi === 3 ? 'active' : ''}`}>
                    <input type="radio" checked={formData.loaiDonVi === 3} onChange={() => setFormData({...formData, loaiDonVi: 3})} />
                    Giám sát
                  </label>
                </div>
              </div>

              <div className="dv-form-grid">
                <div className="dv-form-group">
                  <label className="dv-label">Tên Đơn vị / Doanh nghiệp <span style={{color:'red'}}>*</span></label>
                  <input className="dv-input" type="text" value={formData.tenDonVi} onChange={e => setFormData({...formData, tenDonVi: e.target.value})} placeholder="Vd: HTX Nông nghiệp ABC..." />
                </div>
                <div className="dv-form-group">
                  <label className="dv-label">Mã số thuế <span style={{color:'red'}}>*</span></label>
                  <input className="dv-input" type="text" value={formData.maSoThue} onChange={e => setFormData({...formData, maSoThue: e.target.value})} placeholder="0123456789" />
                </div>
                
                <div className="dv-form-group dv-form-col-full">
                  <label className="dv-label">Loại hình / Quy mô Tổ chức <span style={{color:'red'}}>*</span></label>
                  <select className="dv-select-form" value={formData.quyMo} onChange={e => {
                    const val = e.target.value;
                    setFormData({...formData, quyMo: val});
                    if (formData.loaiDonVi === 1 && val === 'DNLON') {
                      setFormError('Lưu ý: Doanh nghiệp Lớn không thuộc đối tượng Thụ hưởng Khuyến công (chỉ gồm: DNNVV, HTX, THT, HKD).');
                    } else {
                      setFormError(null);
                    }
                  }}>
                    <option value="DNNVV">Doanh nghiệp Nhỏ và Vừa</option>
                    <option value="HTX">Hợp tác xã</option>
                    <option value="THT">Tổ hợp tác</option>
                    <option value="HKD">Hộ kinh doanh</option>
                    <option value="DNLON">Doanh nghiệp Lớn</option>
                  </select>
                </div>

                <div className="dv-form-group dv-form-col-full">
                  <label className="dv-label">Địa bàn (Tỉnh/Huyện/Xã) <span style={{color:'red'}}>*</span></label>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <select className="dv-select-form" style={{flex: 1}} value={formData.maTinh} onChange={e => handleTinhChange(e.target.value)}>
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                    <select className="dv-select-form" style={{flex: 1}} value={formData.maHuyen} onChange={e => handleHuyenChange(e.target.value)} disabled={!formData.maTinh}>
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                    <select className="dv-select-form" style={{flex: 1}} value={formData.maXa} onChange={e => setFormData({...formData, maXa: e.target.value})} disabled={!formData.maHuyen}>
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>
                  {formData.loaiDonVi === 1 && (
                    <span style={{fontSize: 11, color: '#64748b', marginTop: 4}}>
                      <AlertCircle size={10} style={{display:'inline'}}/> Đơn vị Thụ hưởng KHÔNG ĐƯỢC đóng tại Quận (Khu vực nội thành). Dữ liệu đối chiếu trực tiếp từ Danh mục Hành chính QG.
                    </span>
                  )}
                </div>

                <div className="dv-form-group">
                  <label className="dv-label">Số nhà, Tên đường (Chi tiết)</label>
                  <input className="dv-input" type="text" value={soNha} onChange={e => setSoNha(e.target.value)} placeholder="Vd: 123 Đường Lê Lợi" />
                </div>

                <div className="dv-form-group">
                  <label className="dv-label">Số điện thoại liên hệ</label>
                  <input className="dv-input" type="text" value={formData.soDienThoai} onChange={e => setFormData({...formData, soDienThoai: e.target.value})} placeholder="09xxxxxxx" />
                </div>
              </div>
            </div>
            <div className="dv-modal-footer">
              <button className="dv-btn-cancel" onClick={closeModal}>Hủy bỏ</button>
              <button className="dv-btn-submit" onClick={handleSave}>Lưu Đơn vị</button>
            </div>
          </div>
        </div>
      )}

      <CustomDialog 
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => setDialogConfig(prev => ({...prev, isOpen: false}))}
      />
    </div>
  );
}

export default DonViPage;
