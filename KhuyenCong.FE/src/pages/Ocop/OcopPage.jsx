import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit2, Trash2, Award, Star, Building2, Calendar } from 'lucide-react';
import axios from 'axios';
import './OcopPage.css';

const CAP_CHUNG_NHAN_OPTIONS = [
    { value: 'Cấp Huyện', label: 'Cấp Huyện', style: 'cert-huyen' },
    { value: 'Cấp Tỉnh', label: 'Cấp Tỉnh', style: 'cert-tinh' },
    { value: 'Cấp Khu vực', label: 'Cấp Khu vực', style: 'cert-khuvuc' },
    { value: 'Cấp Quốc gia', label: 'Cấp Quốc gia', style: 'cert-quocgia' }
];

const TABS = ['Tất cả', 'Sản phẩm OCOP', 'CNNT Tiêu biểu (Đang dự thi)', 'CNNT Tiêu biểu (Đạt bình chọn)'];

const OcopPage = () => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [capChungNhanFilter, setCapChungNhanFilter] = useState('');
    const [donVis, setDonVis] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        tenSanPham: '',
        donViId: '',
        loaiSanPham: 1, // 1: OCOP, 2: CNNT
        phanHangSao: 3,
        capChungNhan: 'Cấp Tỉnh',
        qD_CongNhan: '',
        ngayCongNhan: '',
        hinhAnh: '',
        trangThai: 1, // 1: Đăng ký dự thi, 2: Đạt bình chọn
        namBinhChon: new Date().getFullYear()
    });

    useEffect(() => {
        fetchProducts();
        fetchDonVis();
    }, [activeTab, capChungNhanFilter]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            let query = `?page=1&pageSize=50`;
            if (search) query += `&search=${search}`;
            if (capChungNhanFilter) query += `&capChungNhan=${capChungNhanFilter}`;
            
            if (activeTab === 'Sản phẩm OCOP') {
                query += `&loaiSanPham=1`;
            } else if (activeTab === 'CNNT Tiêu biểu (Đang dự thi)') {
                query += `&loaiSanPham=2&trangThai=1`;
            } else if (activeTab === 'CNNT Tiêu biểu (Đạt bình chọn)') {
                query += `&loaiSanPham=2&trangThai=2`;
            }
            
            const url = `http://localhost:5242/api/SanPhamOcop${query}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setProducts(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching OCOP products:', error);
        }
    };

    const fetchDonVis = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5242/api/DonVi?page=1&pageSize=100', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDonVis(response.data.data);
        } catch (error) {
            console.error('Error fetching DonVis:', error);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchProducts();
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                tenSanPham: item.tenSanPham,
                donViId: item.donViId,
                loaiSanPham: item.loaiSanPham || 1,
                phanHangSao: item.phanHangSao,
                capChungNhan: item.capChungNhan,
                qD_CongNhan: item.quyetDinhCongNhan,
                ngayCongNhan: item.ngayCongNhan ? item.ngayCongNhan.split('T')[0] : '',
                hinhAnh: item.hinhAnh || '',
                trangThai: item.trangThai || 1,
                namBinhChon: item.namBinhChon || new Date().getFullYear()
            });
            setSelectedItem(item);
        } else {
            setFormData({
                tenSanPham: '',
                donViId: donVis.length > 0 ? donVis[0].id : '',
                loaiSanPham: 1,
                phanHangSao: 3,
                capChungNhan: 'Cấp Tỉnh',
                qD_CongNhan: '',
                ngayCongNhan: '',
                hinhAnh: '',
                trangThai: 1,
                namBinhChon: new Date().getFullYear()
            });
            setSelectedItem(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = {
                tenSanPham: formData.tenSanPham,
                donViId: formData.donViId,
                phanHangSao: Number(formData.phanHangSao),
                capChungNhan: formData.capChungNhan,
                quyetDinhCongNhan: formData.qD_CongNhan,
                ngayCongNhan: formData.ngayCongNhan ? new Date(formData.ngayCongNhan).toISOString() : null,
                hinhAnh: formData.hinhAnh,
                loaiSanPham: Number(formData.loaiSanPham),
                trangThai: Number(formData.loaiSanPham) === 2 ? Number(formData.trangThai) : 1,
                namBinhChon: Number(formData.loaiSanPham) === 2 ? Number(formData.namBinhChon) : null
            };

            if (selectedItem) {
                await axios.put(`http://localhost:5242/api/SanPhamOcop/${selectedItem.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5242/api/SanPhamOcop', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Có lỗi xảy ra khi lưu dữ liệu.');
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5242/api/SanPhamOcop/${selectedItem.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Có lỗi xảy ra khi xóa dữ liệu.');
        }
    };

    const getCertStyle = (cap) => {
        const option = CAP_CHUNG_NHAN_OPTIONS.find(o => o.value === cap);
        return option ? option.style : 'cert-huyen';
    };

    const renderStars = (num) => {
        return (
            <div className="ocop-stars">
                {[...Array(num)].map((_, i) => <Star key={i} size={14} />)}
            </div>
        );
    };

    return (
        <div className="ocop-container">
            <div className="ocop-header-section">
                <div className="ocop-title-group">
                    <h1>Sản phẩm OCOP & CNNT Tiêu biểu</h1>
                    <p>Quản lý danh sách sản phẩm đạt chứng nhận trên địa bàn</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="ocop-action-btn secondary">
                        <Download size={18} />
                        Xuất Excel
                    </button>
                    <button className="ocop-action-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        Thêm Sản Phẩm
                    </button>
                </div>
            </div>

            <div className="ocop-filter-card">
                <div className="ocop-tabs">
                    {TABS.map(tab => (
                        <div 
                            key={tab} 
                            className={`ocop-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                <div className="ocop-search-row">
                    <div className="ocop-search-input">
                        <Search size={18} color="#94a3b8" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên sản phẩm hoặc tên cơ sở..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <select 
                        className="ocop-cert-filter"
                        value={capChungNhanFilter}
                        onChange={(e) => setCapChungNhanFilter(e.target.value)}
                    >
                        <option value="">Tất cả Cấp CN</option>
                        {CAP_CHUNG_NHAN_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="ocop-grid">
                {products.length === 0 ? (
                    <div className="ocop-empty" style={{ gridColumn: '1 / -1' }}>
                        <Award size={48} />
                        <h3>Chưa có sản phẩm nào</h3>
                        <p>Danh sách sản phẩm trống hoặc không có kết quả phù hợp với tìm kiếm.</p>
                    </div>
                ) : (
                    products.map(item => (
                        <div key={item.id} className="ocop-card">
                            <div className="ocop-card-actions">
                                <div className="action-icon edit" onClick={() => handleOpenModal(item)}>
                                    <Edit2 size={16} />
                                </div>
                                <div className="action-icon delete" onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }}>
                                    <Trash2 size={16} />
                                </div>
                            </div>
                            
                            <div className="ocop-card-img" style={{ backgroundImage: `url(${item.hinhAnh || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'})` }}>
                                <div className="ocop-card-top-overlay">
                                    {item.loaiSanPham === 2 ? (
                                        <span className={`ocop-cert-badge ${item.trangThai === 2 ? 'cert-quocgia' : 'cert-huyen'}`}>
                                            {item.trangThai === 2 ? 'CNNT Đạt Bình Chọn' : 'Đăng Ký Dự Thi CNNT'}
                                        </span>
                                    ) : (
                                        <span className={`ocop-cert-badge ${getCertStyle(item.capChungNhan)}`}>
                                            {item.capChungNhan || 'Cấp Huyện'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="ocop-card-body">
                                <div style={{ marginBottom: '8px' }}>
                                    {item.loaiSanPham === 2 ? (
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                                            Năm thi: {item.namBinhChon || '---'}
                                        </span>
                                    ) : (
                                        renderStars(item.phanHangSao)
                                    )}
                                </div>
                                <h3 className="ocop-card-title">{item.tenSanPham}</h3>
                                <div className="ocop-card-donvi">
                                    <Building2 size={14} />
                                    {item.tenDonVi}
                                </div>
                                
                                <div className="ocop-card-info">
                                    <div className="info-item">
                                        <span className="info-label">Năm CN</span>
                                        <span className="info-value">
                                            {item.ngayCongNhan ? new Date(item.ngayCongNhan).getFullYear() : '---'}
                                        </span>
                                    </div>
                                    <div className="info-item" style={{ textAlign: 'right' }}>
                                        <span className="info-label">Số QĐ</span>
                                        <span className="info-value">{item.quyetDinhCongNhan || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="ocop-modal-overlay">
                    <div className="ocop-modal">
                        <div className="ocop-modal-header">
                            <h2 className="ocop-modal-title">{selectedItem ? "Cập nhật Sản Phẩm" : "Thêm mới Sản Phẩm"}</h2>
                        </div>
                        <div className="ocop-modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Tên Sản Phẩm *</label>
                        <input 
                            type="text" 
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            value={formData.tenSanPham}
                            onChange={(e) => setFormData({...formData, tenSanPham: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Đường dẫn Hình ảnh (URL)</label>
                        <input 
                            type="text" 
                            placeholder="Nhập URL hình ảnh sản phẩm (vd: https://...)"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            value={formData.hinhAnh}
                            onChange={(e) => setFormData({...formData, hinhAnh: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Loại Sản Phẩm *</label>
                            <select 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                value={formData.loaiSanPham}
                                onChange={(e) => setFormData({...formData, loaiSanPham: Number(e.target.value)})}
                            >
                                <option value={1}>Sản phẩm OCOP</option>
                                <option value={2}>CNNT Tiêu biểu</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Đơn Vị Chủ Thể *</label>
                            <select 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                value={formData.donViId}
                                onChange={(e) => setFormData({...formData, donViId: e.target.value})}
                            >
                                <option value="">-- Chọn đơn vị --</option>
                                {donVis.map(dv => (
                                    <option key={dv.id} value={dv.id}>{dv.tenDonVi}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {formData.loaiSanPham === 1 && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Hạng Sao</label>
                                <select 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.phanHangSao}
                                    onChange={(e) => setFormData({...formData, phanHangSao: e.target.value})}
                                >
                                    {[3, 4, 5].map(s => (
                                        <option key={s} value={s}>{s} Sao</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Cấp Chứng Nhận</label>
                                <select 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.capChungNhan}
                                    onChange={(e) => setFormData({...formData, capChungNhan: e.target.value})}
                                >
                                    {CAP_CHUNG_NHAN_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    {formData.loaiSanPham === 2 && (
                        <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: '#1e3a8a' }}>Trạng thái dự thi *</label>
                                <select 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.trangThai}
                                    onChange={(e) => setFormData({...formData, trangThai: Number(e.target.value)})}
                                >
                                    <option value={1}>Đăng ký dự thi</option>
                                    <option value={2}>Đạt bình chọn</option>
                                    <option value={3}>Không đạt</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: '#1e3a8a' }}>Năm bình chọn *</label>
                                <input 
                                    type="number" 
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    value={formData.namBinhChon}
                                    onChange={(e) => setFormData({...formData, namBinhChon: e.target.value})}
                                />
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Số Quyết Định</label>
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                value={formData.qD_CongNhan}
                                onChange={(e) => setFormData({...formData, qD_CongNhan: e.target.value})}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Ngày Công Nhận</label>
                            <input 
                                type="date" 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                value={formData.ngayCongNhan}
                                onChange={(e) => setFormData({...formData, ngayCongNhan: e.target.value})}
                            />
                        </div>
                    </div>
                            </div>
                        </div>
                        <div className="ocop-modal-footer">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="ocop-modal-btn cancel"
                            >Hủy</button>
                            <button 
                                onClick={handleSave}
                                disabled={!formData.tenSanPham || !formData.donViId}
                                className="ocop-modal-btn save"
                            >Lưu Sản Phẩm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="ocop-modal-overlay">
                    <div className="ocop-modal delete">
                        <div className="ocop-modal-header">
                            <h2 className="ocop-modal-title">Xác nhận xóa</h2>
                        </div>
                        <div className="ocop-modal-body" style={{ color: '#475569', paddingTop: '16px' }}>
                            Bạn có chắc chắn muốn xóa sản phẩm <b>{selectedItem?.tenSanPham}</b> không? Hành động này không thể hoàn tác.
                        </div>
                        <div className="ocop-modal-footer">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="ocop-modal-btn cancel"
                            >Hủy</button>
                            <button 
                                onClick={handleDelete}
                                className="ocop-modal-btn delete-btn"
                            >Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OcopPage;
