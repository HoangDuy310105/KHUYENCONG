import { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Inbox } from 'lucide-react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import './LinhVuc.css';

function LinhVucPage() {
  const { showAlert } = useDialog();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    maLinhVuc: '',
    tenLinhVuc: '',
    moTa: '',
    dinhMucHoTroMax: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/linhvuc');
      setData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      showAlert('Lỗi', 'Không thể tải danh sách lĩnh vực', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.tenLinhVuc.toLowerCase().includes(search.toLowerCase()) ||
    item.maLinhVuc.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (item = null) => {
    if (item && typeof item === 'object' && item.id) {
      setEditingItem(item);
      setFormData({
        maLinhVuc: item.maLinhVuc || '',
        tenLinhVuc: item.tenLinhVuc || '',
        moTa: item.moTa || '',
        dinhMucHoTroMax: item.dinhMucHoTroMax || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        maLinhVuc: '',
        tenLinhVuc: '',
        moTa: '',
        dinhMucHoTroMax: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      if (!formData.maLinhVuc || !formData.tenLinhVuc) {
        showAlert("Cảnh báo", "Vui lòng nhập Mã và Tên lĩnh vực!", "warning");
        return;
      }

      const payload = {
        maLinhVuc: formData.maLinhVuc,
        tenLinhVuc: formData.tenLinhVuc,
        moTa: formData.moTa || null,
        dinhMucHoTroMax: formData.dinhMucHoTroMax ? parseFloat(formData.dinhMucHoTroMax) : null
      };

      if (editingItem) {
        // Cập nhật (PUT)
        await api.put(`/linhvuc/${editingItem.id}`, payload);
      } else {
        // Tạo mới (POST)
        await api.post('/linhvuc', payload);
      }
      
      setIsModalOpen(false);
      fetchData();
      showAlert("Thành công", "Đã lưu lĩnh vực thành công!", "success");
    } catch (error) {
      showAlert("Lỗi", "Có lỗi xảy ra: " + (error.response?.data?.message || error.message), "danger");
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "Không có giới hạn";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="lv-container">
      {/* HEADER SECTION */}
      <div className="lv-header">
        <div className="lv-title-section">
          <div className="lv-icon-wrapper">
            <Layers size={24} />
          </div>
          <div>
            <h2>Lĩnh vực & Loại Đề án</h2>
            <div className="lv-subtitle">Quản lý danh mục các lĩnh vực Khuyến công</div>
          </div>
        </div>

        <div className="lv-actions">
          <div className="lv-search">
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm mã, tên lĩnh vực..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Thêm Lĩnh vực
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="lv-content">
        <table className="lv-table">
          <thead>
            <tr>
              <th width="5%">STT</th>
              <th width="15%">Mã Lĩnh vực</th>
              <th width="30%">Tên Lĩnh vực</th>
              <th width="20%">Định mức (Tối đa)</th>
              <th width="20%">Mô tả</th>
              <th width="10%">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td><div className="skeleton-box" style={{ width: '20px' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '80%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '70%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '90%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '40px' }}></div></td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <Inbox size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
                  <h4 style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy lĩnh vực nào</h4>
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td><span className="lv-tag">{item.maLinhVuc}</span></td>
                  <td style={{ fontWeight: 600 }}>{item.tenLinhVuc}</td>
                  <td>
                    {item.dinhMucHoTroMax ? (
                      <span className="lv-money">{formatCurrency(item.dinhMucHoTroMax)}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Không giới hạn</span>
                    )}
                  </td>
                  <td>
                    {item.moTa ? (
                      item.moTa
                    ) : (
                      <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '13px' }}>Chưa có mô tả</span>
                    )}
                  </td>
                  <td>
                    <div className="lv-action-buttons">
                      <button className="btn-icon" title="Chỉnh sửa" onClick={() => handleOpenModal(item)}>
                        <Edit2 size={16} />
                      </button>
                      {/* 
                        Nút xóa đã bị ẩn do Backend chưa hỗ trợ xóa Lĩnh vực 
                        (để bảo vệ dữ liệu Đề án) 
                      */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <div className="lv-modal-overlay" onClick={handleCloseModal}>
          <div className="lv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lv-modal-header">
              <h3>{editingItem ? 'Chỉnh sửa Lĩnh vực' : 'Thêm Lĩnh vực mới'}</h3>
              <button className="lv-modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <div className="lv-modal-body">
              <div className="lv-form-group">
                <label>Mã Lĩnh vực *</label>
                <input 
                  type="text" 
                  className="lv-form-control" 
                  value={formData.maLinhVuc}
                  onChange={(e) => setFormData({...formData, maLinhVuc: e.target.value})}
                  placeholder="VD: LV01"
                />
              </div>

              <div className="lv-form-group">
                <label>Tên Lĩnh vực *</label>
                <input 
                  type="text" 
                  className="lv-form-control" 
                  value={formData.tenLinhVuc}
                  onChange={(e) => setFormData({...formData, tenLinhVuc: e.target.value})}
                  placeholder="Nhập tên lĩnh vực khuyến công"
                />
              </div>

              <div className="lv-form-group">
                <label>Định mức Hỗ trợ tối đa (VNĐ)</label>
                <input 
                  type="number" 
                  className="lv-form-control" 
                  value={formData.dinhMucHoTroMax}
                  onChange={(e) => setFormData({...formData, dinhMucHoTroMax: e.target.value})}
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>

              <div className="lv-form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  className="lv-form-control" 
                  value={formData.moTa}
                  onChange={(e) => setFormData({...formData, moTa: e.target.value})}
                  placeholder="Thông tin thêm..."
                />
              </div>
            </div>

            <div className="lv-modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
              <button className="btn-save" onClick={handleSave}>
                <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinhVucPage;
