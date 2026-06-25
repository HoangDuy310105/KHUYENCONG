import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit2, Trash2, Award, Star, Building2, CheckCircle, XCircle, X, UploadCloud, Package, Clock } from 'lucide-react';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import SecureImage from '../../components/SecureImage/SecureImage';
import './OcopPage.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', backgroundColor: '#fee2e2', height: '100vh' }}>
                    <h2>Đã có lỗi xảy ra trong giao diện React:</h2>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const CAP_CHUNG_NHAN_OPTIONS = [
    { value: 'Cấp Huyện', label: 'Cấp Huyện', style: 'cert-huyen' },
    { value: 'Cấp Tỉnh', label: 'Cấp Tỉnh', style: 'cert-tinh' },
    { value: 'Cấp Khu vực', label: 'Cấp Khu vực', style: 'cert-khuvuc' },
    { value: 'Cấp Quốc gia', label: 'Cấp Quốc gia', style: 'cert-quocgia' }
];

const TABS = ['Tất cả', 'Sản phẩm OCOP', 'CNNT Tiêu biểu (Đang dự thi)', 'CNNT Tiêu biểu (Đạt bình chọn)'];

const OcopPageContent = () => {
    const role = localStorage.getItem('role');
    const isCoSo = role === 'Role_CoSo' || role === '1';
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [search, setSearch] = useState('');
    const [capChungNhanFilter, setCapChungNhanFilter] = useState('');
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [isUploading, setIsUploading] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });

        if (type === 'success') {
            const duration = 2000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }
                const particleCount = Math.floor(40 * (timeLeft / duration));
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }

        setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
    };
    const [donVis, setDonVis] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [voteFormData, setVoteFormData] = useState({
        trangThai: 2, // Mặc định là Đạt bình chọn
        namBinhChon: new Date().getFullYear(),
        qD_CongNhan: '',
        ngayCongNhan: ''
    });
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
                query += `&loaiSanPham=2&trangThaiList=0,1`;
            } else if (activeTab === 'CNNT Tiêu biểu (Đạt bình chọn)') {
                query += `&loaiSanPham=2&trangThaiList=2,3`;
            }

            const response = await api.get(`/SanPhamOcop${query}`);

            setProducts(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching OCOP products:', error);
        }
    };

    const fetchDonVis = async () => {
        try {
            const response = await api.get('/DonVi?page=1&pageSize=100');
            const donViData = response.data?.data || response.data?.Data || response.data?.items || response.data?.Items || (Array.isArray(response.data) ? response.data : []);
            setDonVis(donViData);
            if (!formData.donViId) {
                const userDonViId = localStorage.getItem('donViId');
                if (isCoSo && userDonViId) {
                    setFormData(prev => ({ ...prev, donViId: userDonViId }));
                } else if (donViData.length > 0) {
                    setFormData(prev => ({ ...prev, donViId: donViData[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching DonVis:', error);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchProducts();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const uploadData = new FormData();
            uploadData.append('file', file);
            const res = await api.post('/file/upload', uploadData);
            if (res.data && res.data.fileUrl) {
                setFormData({ ...formData, hinhAnh: res.data.fileUrl });
                showToast('Đã tải ảnh lên thành công!', 'success');
            }
        } catch (error) {
            console.error('Lỗi tải ảnh:', error);
            showToast('Không thể tải ảnh lên server.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                id: item.id,
                tenSanPham: item.tenSanPham || '',
                donViId: item.donViId || '',
                phanHangSao: item.phanHangSao || 0,
                capChungNhan: item.capChungNhan || '',
                ngayCongNhan: item.ngayCongNhan ? new Date(item.ngayCongNhan).toISOString().split('T')[0] : '',
                quyetDinhCongNhan: item.quyetDinhCongNhan || '',
                hinhAnh: item.hinhAnh || '',
                moTa: item.moTa || '',
                loaiSanPham: item.loaiSanPham || 1,
                trangThai: item.trangThai || 0,
                namBinhChon: item.namBinhChon || new Date().getFullYear()
            });
            setSelectedItem(item);
        } else {
            const userDonViId = localStorage.getItem('donViId');
            setFormData({
                id: null,
                tenSanPham: '',
                donViId: isCoSo ? (userDonViId || (donVis.length > 0 ? donVis[0].id : '')) : (donVis.length > 0 ? donVis[0].id : ''),
                phanHangSao: 0,
                capChungNhan: '',
                ngayCongNhan: '',
                quyetDinhCongNhan: '',
                hinhAnh: '',
                moTa: '',
                loaiSanPham: activeTab.includes('CNNT') ? 2 : 1,
                trangThai: 0,
                namBinhChon: new Date().getFullYear()
            });
            setSelectedItem(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (isSubmit = false) => {
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
                moTa: formData.moTa,
                loaiSanPham: Number(formData.loaiSanPham),
                trangThai: isSubmit ? 1 : Number(formData.trangThai),
                namBinhChon: Number(formData.loaiSanPham) === 2 ? Number(formData.namBinhChon) : null
            };

            if (selectedItem) {
                await api.put(`/SanPhamOcop/${selectedItem.id}`, payload);
            } else {
                await api.post('/SanPhamOcop', payload);
            }
            setIsModalOpen(false);
            fetchProducts();
            if (isSubmit) {
                showToast('Nộp hồ sơ dự thi thành công!');
            } else {
                showToast(isCoSo ? 'Lưu nháp thành công!' : 'Lưu sản phẩm thành công!');
            }
        } catch (error) {
            console.error('Error saving:', error);
            showToast('Có lỗi xảy ra khi lưu dữ liệu.', 'error');
        }
    };

    const handleOpenVoteModal = (item) => {
        setSelectedItem(item);
        setVoteFormData({
            trangThai: 2,
            namBinhChon: item.namBinhChon || new Date().getFullYear(),
            qD_CongNhan: item.quyetDinhCongNhan || '',
            ngayCongNhan: item.ngayCongNhan ? item.ngayCongNhan.split('T')[0] : ''
        });
        setIsVoteModalOpen(true);
    };

    const handleVoteSubmit = async () => {
        if (!selectedItem) return;
        try {
            const payload = {
                ...selectedItem,
                trangThai: voteFormData.trangThai,
                namBinhChon: voteFormData.trangThai === 2 ? Number(voteFormData.namBinhChon) : null,
                quyetDinhCongNhan: voteFormData.trangThai === 2 ? voteFormData.qD_CongNhan : '',
                ngayCongNhan: (voteFormData.trangThai === 2 && voteFormData.ngayCongNhan) ? new Date(voteFormData.ngayCongNhan).toISOString() : null
            };

            await api.put(`/SanPhamOcop/${selectedItem.id}`, payload);
            setIsVoteModalOpen(false);
            fetchProducts();
            showToast('Đã lưu kết quả bình chọn thành công!');
        } catch (error) {
            console.error('Error submitting vote:', error);
            showToast('Có lỗi xảy ra khi lưu kết quả bình chọn.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await api.delete(`/SanPhamOcop/${selectedItem.id}`);
            setIsDeleteModalOpen(false);
            fetchProducts();
            showToast('Đã xóa sản phẩm thành công!');
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('Có lỗi xảy ra khi xóa dữ liệu.', 'error');
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
            {/* Center Modal Notification */}
            {toast.visible && (
                <div className="ocop-modal-overlay" style={{ zIndex: 100000 }}>
                    <div className="ocop-modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '0' }}>
                        <div style={{ padding: '32px 24px 24px' }}>
                            <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                                {toast.type === 'error' ? (
                                    <XCircle size={64} color="#ef4444" />
                                ) : (
                                    <CheckCircle size={64} color="#10b981" />
                                )}
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                                {toast.type === 'error' ? 'Thất bại!' : 'Thành công!'}
                            </h2>
                            <p style={{ color: '#475569', margin: '0' }}>{toast.message}</p>
                        </div>
                        <div className="ocop-modal-footer" style={{ justifyContent: 'center', background: '#f8fafc' }}>
                            <button
                                onClick={() => setToast({ ...toast, visible: false })}
                                className="ocop-modal-btn save"
                                style={{ width: '120px' }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    {(role === '4' || role === '2' || role === 'Role_Admin' || role === 'Role_So' || isCoSo) && (
                        <button className="ocop-action-btn" onClick={() => handleOpenModal()}>
                            <Plus size={18} />
                            Thêm Sản Phẩm
                        </button>
                    )}
                </div>
            </div>

            {/* Thêm Dashboard Cards cho role CNNT */}
            {isCoSo && (
                <div className="db-grid-3" style={{ marginBottom: '24px' }}>
                    <div className="stat-card" style={{ borderLeftColor: '#94a3b8' }}>
                        <div className="stat-info">
                            <p className="stat-label">SẢN PHẨM NHÁP</p>
                            <p className="stat-value">{products.filter(x => x.trangThai === 0).length}</p>
                        </div>
                        <div className="stat-icon" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}><Package size={24} /></div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
                        <div className="stat-info">
                            <p className="stat-label">ĐANG DỰ THI</p>
                            <p className="stat-value">{products.filter(x => x.trangThai === 1).length}</p>
                        </div>
                        <div className="stat-icon blue"><Clock size={24} /></div>
                    </div>
                    <div className="stat-card" style={{ borderLeftColor: '#d97706' }}>
                        <div className="stat-info">
                            <p className="stat-label">ĐẠT CHỨNG NHẬN</p>
                            <p className="stat-value" style={{ color: '#d97706' }}>{products.filter(x => x.trangThai >= 2).length}</p>
                        </div>
                        <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}><Star size={24} /></div>
                    </div>
                </div>
            )}

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
                                {!isCoSo && item.loaiSanPham === 2 && item.trangThai === 1 ? (
                                    <div className="action-icon" onClick={() => handleOpenVoteModal(item)} style={{ background: '#1e40af', color: 'white', border: 'none' }} title="Bình chọn CNNT">
                                        <Award size={16} />
                                    </div>
                                ) : (
                                    (role === '4' || role === '2' || role === 'Role_Admin' || role === 'Role_So' || (isCoSo && item.trangThai === 0)) && (
                                        <div className="action-icon edit" onClick={() => handleOpenModal(item)}>
                                            <Edit2 size={16} />
                                        </div>
                                    )
                                )}
                                {(role === '4' || role === '2' || role === 'Role_Admin' || role === 'Role_So' || (isCoSo && item.trangThai === 0)) && (
                                    <div className="action-icon delete" onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }}>
                                        <Trash2 size={16} />
                                    </div>
                                )}
                            </div>

                            <SecureImage 
                                asBackground={true}
                                className="ocop-card-img" 
                                src={item.hinhAnh} 
                                fallbackSrc="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300"
                            >
                                <div className="ocop-card-top-overlay">
                                    {item.trangThai === 0 ? (
                                        <span className="ocop-cert-badge" style={{ backgroundColor: '#64748b', color: 'white' }}>
                                            Bản nháp
                                        </span>
                                    ) : item.loaiSanPham === 2 ? (
                                        item.trangThai === 3 ? (
                                            <span 
                                                className="ocop-cert-badge"
                                                style={{ 
                                                    backgroundColor: 'rgba(220, 38, 38, 0.9)', 
                                                    color: '#ffffff', 
                                                    border: '1px solid #b91c1c',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontWeight: 600,
                                                    padding: '4px 8px',
                                                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                                                }}
                                            >
                                                <XCircle size={14} strokeWidth={2.5} />
                                                KHÔNG ĐẠT GIẢI
                                            </span>
                                        ) : (
                                            <span className={`ocop-cert-badge ${item.trangThai === 2 ? 'cert-quocgia' : 'cert-huyen'}`}>
                                                {item.trangThai === 2 ? 'CNNT ĐẠT BÌNH CHỌN' : 'ĐĂNG KÝ DỰ THI CNNT'}
                                            </span>
                                        )
                                    ) : (
                                        <span className={`ocop-cert-badge ${getCertStyle(item.capChungNhan)}`}>
                                            {item.capChungNhan || 'Cấp Huyện'}
                                        </span>
                                    )}
                                </div>
                            </SecureImage>

                            <div className="ocop-card-body">
                                <div style={{ marginBottom: '8px', minHeight: '20px' }}>
                                    {item.trangThai === 0 ? (
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Chưa đánh giá</span>
                                    ) : item.loaiSanPham === 2 ? (
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

                                {item.trangThai === 0 ? (
                                    <div className="ocop-card-info" style={{ justifyContent: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Chưa nộp hồ sơ</span>
                                    </div>
                                ) : (
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
                                )}
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
                            <h2 className="ocop-modal-title">
                                {selectedItem
                                    ? (isCoSo ? "Chi tiết đăng ký dự thi" : "Cập nhật Sản Phẩm")
                                    : (isCoSo ? "Đăng ký dự thi sản phẩm mới" : "Thêm mới Sản Phẩm")}
                            </h2>
                        </div>
                        <div className="ocop-modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Tên Sản Phẩm *</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        value={formData.tenSanPham}
                                        onChange={(e) => setFormData({ ...formData, tenSanPham: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Hình ảnh Sản phẩm</label>
                                    <label
                                        style={{
                                            display: formData.hinhAnh ? 'none' : 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '32px 24px',
                                            borderRadius: '8px',
                                            border: '2px dashed #cbd5e1',
                                            backgroundColor: isUploading ? '#f8fafc' : '#ffffff',
                                            cursor: isUploading ? 'wait' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            marginBottom: formData.hinhAnh ? '16px' : '0'
                                        }}
                                        onMouseOver={(e) => { if (!isUploading) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#f0f9ff'; } }}
                                        onMouseOut={(e) => { if (!isUploading) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; } }}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                        <div style={{ color: isUploading ? '#94a3b8' : '#3b82f6', marginBottom: '12px' }}>
                                            <UploadCloud size={40} />
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                                            {isUploading ? 'Đang xử lý hình ảnh...' : 'Bấm vào đây để tải ảnh lên'}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            Hỗ trợ định dạng ảnh (Tối đa 5MB)
                                        </span>
                                    </label>
                                    {formData.hinhAnh && (
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            borderRadius: '8px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px dashed #cbd5e1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            padding: '8px',
                                            position: 'relative'
                                        }}>
                                            <SecureImage
                                                src={formData.hinhAnh}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                            <label style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(59, 130, 246, 0.9)', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: isUploading ? 'wait' : 'pointer', fontSize: '0.85rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}>
                                                <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                                                {isUploading ? 'Đang xử lý...' : 'Thay đổi ảnh'}
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Mô Tả Sản Phẩm</label>
                                    <textarea
                                        placeholder="Nhập thông tin chi tiết: nguyên liệu, quy trình, đặc điểm nổi bật..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical' }}
                                        value={formData.moTa}
                                        onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Loại Sản Phẩm *</label>
                                        <select
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            value={formData.loaiSanPham}
                                            onChange={(e) => setFormData({ ...formData, loaiSanPham: Number(e.target.value) })}
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
                                            onChange={(e) => setFormData({ ...formData, donViId: e.target.value })}
                                        >
                                            <option value="">-- Chọn đơn vị --</option>
                                            {donVis.map(dv => (
                                                <option key={dv.id} value={dv.id}>{dv.tenDonVi}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {formData.loaiSanPham === 1 && !(isCoSo && formData.trangThai === 0) && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Hạng Sao</label>
                                            <select
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isCoSo ? '#f1f5f9' : 'white' }}
                                                value={formData.phanHangSao}
                                                onChange={(e) => setFormData({ ...formData, phanHangSao: e.target.value })}
                                                disabled={isCoSo}
                                            >
                                                {[3, 4, 5].map(s => (
                                                    <option key={s} value={s}>{s} Sao</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Cấp Chứng Nhận</label>
                                            <select
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isCoSo ? '#f1f5f9' : 'white' }}
                                                value={formData.capChungNhan}
                                                onChange={(e) => setFormData({ ...formData, capChungNhan: e.target.value })}
                                                disabled={isCoSo}
                                            >
                                                {CAP_CHUNG_NHAN_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {formData.loaiSanPham === 2 && !(isCoSo && formData.trangThai === 0) && (
                                    <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: '#1e3a8a' }}>Trạng thái dự thi *</label>
                                            <select
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isCoSo ? '#f1f5f9' : 'white' }}
                                                value={formData.trangThai}
                                                onChange={(e) => setFormData({ ...formData, trangThai: Number(e.target.value) })}
                                                disabled={isCoSo}
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
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isCoSo ? '#f1f5f9' : 'white' }}
                                                value={formData.namBinhChon}
                                                onChange={(e) => setFormData({ ...formData, namBinhChon: e.target.value })}
                                                disabled={isCoSo}
                                            />
                                        </div>
                                    </div>
                                )}
                                {!(isCoSo && formData.trangThai === 0) && (
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Số Quyết Định</label>
                                            <input
                                                type="text"
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isCoSo ? '#f1f5f9' : 'white' }}
                                                value={formData.qD_CongNhan}
                                                onChange={(e) => setFormData({ ...formData, qD_CongNhan: e.target.value })}
                                                disabled={isCoSo}
                                                placeholder={isCoSo ? 'Chờ Sở cập nhật' : ''}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Ngày Công Nhận</label>
                                            <input
                                                type="date"
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: isCoSo ? '#f1f5f9' : 'white' }}
                                                value={formData.ngayCongNhan}
                                                onChange={(e) => setFormData({ ...formData, ngayCongNhan: e.target.value })}
                                                disabled={isCoSo}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ocop-modal-footer">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="ocop-modal-btn cancel"
                            >Hủy</button>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={!formData.tenSanPham || !formData.donViId}
                                className="ocop-modal-btn save"
                            >
                                {isCoSo ? 'Lưu Nháp' : 'Lưu Sản Phẩm'}
                            </button>
                            {isCoSo && selectedItem && formData.trangThai === 0 && (
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={!formData.tenSanPham || !formData.donViId}
                                    className="ocop-modal-btn save"
                                    style={{ backgroundColor: '#16a34a', color: 'white' }}
                                >
                                    Nộp Hồ Sơ Dự Thi
                                </button>
                            )}
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

            {/* Vote Modal (Judging Panel) */}
            {isVoteModalOpen && selectedItem && (
                <div className="ocop-modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="vote-modal-container">
                        <div className="vote-modal-header">
                            <h2><Award size={24} /> Hội Đồng Bình Chọn Sản Phẩm CNNT</h2>
                            <button className="vote-modal-close" onClick={() => setIsVoteModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="vote-split-layout">
                            {/* Left Column: Product Details */}
                            <div className="vote-product-preview">
                                <SecureImage
                                    src={selectedItem.hinhAnh}
                                    fallbackSrc="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
                                    alt="Sản phẩm"
                                    className="vote-product-img"
                                />
                                <h3 className="vote-product-title">{selectedItem.tenSanPham}</h3>
                                <div className="vote-product-donvi">
                                    <Building2 size={16} />
                                    {selectedItem.tenDonVi}
                                </div>
                                <div className="vote-product-desc">
                                    {selectedItem.moTa || 'Không có mô tả chi tiết cho sản phẩm này.'}
                                </div>
                            </div>

                            {/* Right Column: Judging Decision */}
                            <div className="vote-decision-panel">
                                <h4 className="vote-panel-title">Quyết Định Của Hội Đồng</h4>

                                <div className="vote-cards-container">
                                    <div
                                        className={`vote-card pass ${voteFormData.trangThai === 2 ? 'selected' : ''}`}
                                        onClick={() => setVoteFormData({ ...voteFormData, trangThai: 2 })}
                                    >
                                        <Award size={32} />
                                        <span className="vote-card-title">Đạt Bình Chọn</span>
                                    </div>
                                    <div
                                        className={`vote-card fail ${voteFormData.trangThai === 3 ? 'selected' : ''}`}
                                        onClick={() => setVoteFormData({ ...voteFormData, trangThai: 3 })}
                                    >
                                        <XCircle size={32} />
                                        <span className="vote-card-title">Không Đạt</span>
                                    </div>
                                </div>

                                {voteFormData.trangThai === 2 && (
                                    <div className="vote-details-form" style={{ animation: 'modal-fade-in 0.3s ease-out' }}>
                                        <div className="vote-form-group">
                                            <label>Năm đạt giải *</label>
                                            <input
                                                type="number"
                                                value={voteFormData.namBinhChon}
                                                onChange={(e) => setVoteFormData({ ...voteFormData, namBinhChon: e.target.value })}
                                            />
                                        </div>
                                        <div className="vote-form-group">
                                            <label>Số Quyết Định (Tùy chọn)</label>
                                            <input
                                                type="text"
                                                placeholder="Ví dụ: 123/QĐ-UBND"
                                                value={voteFormData.qD_CongNhan}
                                                onChange={(e) => setVoteFormData({ ...voteFormData, qD_CongNhan: e.target.value })}
                                            />
                                        </div>
                                        <div className="vote-form-group">
                                            <label>Ngày Công Nhận (Tùy chọn)</label>
                                            <input
                                                type="date"
                                                value={voteFormData.ngayCongNhan}
                                                onChange={(e) => setVoteFormData({ ...voteFormData, ngayCongNhan: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="vote-modal-footer">
                            <button
                                onClick={() => setIsVoteModalOpen(false)}
                                className="ocop-modal-btn cancel"
                                style={{ padding: '12px 24px' }}
                            >
                                Hủy Quyết Định
                            </button>
                            <button
                                onClick={handleVoteSubmit}
                                className="ocop-modal-btn save"
                                style={{ padding: '12px 24px', fontSize: '1rem' }}
                            >
                                <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                Xác Nhận Kết Quả
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const OcopPage = () => (
    <ErrorBoundary>
        <OcopPageContent />
    </ErrorBoundary>
);

export default OcopPage;
