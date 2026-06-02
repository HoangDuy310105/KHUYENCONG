import { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, Edit, Trash2, Download, 
  CheckCircle, XCircle, LayoutGrid, Calendar, Hash 
} from 'lucide-react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import './VanBan.css';

function VanBanPage() {
  const { showAlert, showConfirm } = useDialog();
  const [activeTab, setActiveTab] = useState(1); // 1: Văn bản, 2: Hội nghị
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  
  const userRole = localStorage.getItem('role');
  const canEdit = userRole === '4' || userRole === '2'; // Admin & Sở
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    soKyHieu: '',
    trichYeu: '',
    ngayHieuLuc: '',
    trangThai: 1,
    fileDinhKem: null,
    loaiTaiLieu: 1
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, activeTab, keyword]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/van-ban?page=${page}&pageSize=${pageSize}&loaiTaiLieu=${activeTab}&keyword=${encodeURIComponent(keyword)}`);
      if (res.data) {
        setData(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);
    setPage(1);
  };
  
  const openModal = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        soKyHieu: item.soKyHieu,
        trichYeu: item.trichYeu,
        ngayHieuLuc: item.ngayHieuLuc ? item.ngayHieuLuc.substring(0, 10) : '',
        trangThai: item.trangThai,
        fileDinhKem: null, // Khởi tạo fileDinhKem là null để chọn file mới nếu cần
        loaiTaiLieu: item.loaiTaiLieu
      });
    } else {
      setFormData({
        id: null,
        soKyHieu: '',
        trichYeu: '',
        ngayHieuLuc: '',
        trangThai: 1,
        fileDinhKem: null,
        loaiTaiLieu: activeTab
      });
    }
    setShowModal(true);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, fileDinhKem: e.target.files[0] });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.soKyHieu || !formData.trichYeu) {
      showAlert('Lỗi', 'Vui lòng nhập đủ Số/Ký hiệu và Trích yếu.', 'danger');
      return;
    }
    
    setUploading(true);
    try {
      let fileUrl = null;
      
      // Nếu có chọn file mới thì upload file trước
      if (formData.fileDinhKem instanceof File) {
        const fileData = new FormData();
        fileData.append('file', formData.fileDinhKem);
        const uploadRes = await api.post('/file/upload', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Cần đảm bảo endpoint /file/upload trả về đúng đường dẫn
        // Tuỳ theo định dạng của uploadRes, ta lấy path tương ứng.
        fileUrl = uploadRes.data?.path || uploadRes.data?.url || uploadRes.data;
        if (typeof fileUrl === 'object') {
            fileUrl = fileUrl.fileUrl || fileUrl.url;
        }
      }
      
      const payload = {
        soKyHieu: formData.soKyHieu,
        trichYeu: formData.trichYeu,
        ngayHieuLuc: formData.ngayHieuLuc || null,
        trangThai: Number(formData.trangThai),
        loaiTaiLieu: formData.loaiTaiLieu,
      };
      
      if (fileUrl) {
        payload.fileDinhKem = fileUrl;
      }
      
      if (formData.id) {
        await api.put(`/van-ban/${formData.id}`, payload);
      } else {
        await api.post('/van-ban', payload);
      }
      
      setShowModal(false);
      fetchData();
      showAlert('Thành công', 'Lưu tài liệu thành công!', 'success');
    } catch (error) {
      showAlert('Lỗi', 'Lỗi: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm("Xác nhận xóa", 'Bạn có chắc chắn muốn xóa tài liệu này?', "warning");
    if (isConfirmed) {
      try {
        await api.delete(`/van-ban/${id}`);
        fetchData();
        showAlert('Thành công', 'Đã xóa tài liệu thành công!', 'success');
      } catch (error) {
        showAlert('Lỗi', 'Lỗi khi xóa: ' + (error.response?.data?.message || error.message), 'danger');
      }
    }
  };

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      showAlert('Thông báo', 'Tài liệu này không có file đính kèm.', 'info');
      return;
    }
    // Xử lý download/view file
    const url = fileUrl.startsWith('http') ? fileUrl : `http://localhost:9000/${fileUrl}`;
    window.open(url, '_blank');
  };

  return (
    <div className="vanban-container">
      <div className="vanban-header">
        <div className="header-title">
          <FileText size={24} className="title-icon" />
          <h2>Thư viện Văn bản & Tài liệu</h2>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo Số/Ký hiệu, Trích yếu..." 
              value={keyword}
              onChange={handleSearch}
            />
          </div>
          
          {canEdit && (
            <button className="btn-add-primary" onClick={() => openModal()}>
              <Plus size={18} />
              Thêm mới
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="vanban-tabs">
        <button 
          className={`tab-item ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => { setActiveTab(1); setPage(1); }}
        >
          <FileText size={16} />
          Văn bản pháp luật (Nghị định, Thông tư)
        </button>
        <button 
          className={`tab-item ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => { setActiveTab(2); setPage(1); }}
        >
          <LayoutGrid size={16} />
          Tài liệu Hội nghị Xúc tiến
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="vanban-content">
        <div className="table-responsive">
          <table className="vanban-table">
            <thead>
              <tr>
                <th width="5%">STT</th>
                <th width="20%">Số / Ký hiệu</th>
                <th width="40%">Trích yếu nội dung</th>
                <th width="15%">Ngày hiệu lực</th>
                <th width="10%">Trạng thái</th>
                <th width="10%">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Đang tải dữ liệu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Chưa có tài liệu nào.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{(page - 1) * pageSize + index + 1}</td>
                    <td className="font-semibold text-navy">{item.soKyHieu}</td>
                    <td>{item.trichYeu}</td>
                    <td className="text-center">
                      {item.ngayHieuLuc ? new Date(item.ngayHieuLuc).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="text-center">
                      {item.trangThai === 1 ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} className="mr-1"/> Còn hiệu lực
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          <XCircle size={12} className="mr-1"/> Hết hiệu lực
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-download" 
                          title="Tải/Xem file"
                          onClick={() => handleDownload(item.fileDinhKem)}
                          disabled={!item.fileDinhKem}
                        >
                          <Download size={16} />
                        </button>
                        {canEdit && (
                          <>
                            <button className="btn-icon btn-edit" title="Sửa" onClick={() => openModal(item)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(item.id)}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        {totalCount > pageSize && (
          <div className="pagination">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </button>
            <span className="page-info">
              Trang {page} / {Math.ceil(totalCount / pageSize)}
            </span>
            <button 
              disabled={page >= Math.ceil(totalCount / pageSize)} 
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? 'Cập nhật Tài liệu' : 'Thêm mới Tài liệu'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label><Hash size={14} className="inline mr-1" />Số / Ký hiệu (*)</label>
                <input 
                  type="text" 
                  value={formData.soKyHieu} 
                  onChange={(e) => setFormData({...formData, soKyHieu: e.target.value})} 
                  required 
                  placeholder="Ví dụ: 28/2018/TT-BTC"
                />
              </div>
              
              <div className="form-group">
                <label><FileText size={14} className="inline mr-1" />Trích yếu nội dung (*)</label>
                <textarea 
                  value={formData.trichYeu} 
                  onChange={(e) => setFormData({...formData, trichYeu: e.target.value})} 
                  required
                  rows="3"
                  placeholder="Nhập trích yếu..."
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label><Calendar size={14} className="inline mr-1" />Ngày hiệu lực</label>
                  <input 
                    type="date" 
                    value={formData.ngayHieuLuc} 
                    onChange={(e) => setFormData({...formData, ngayHieuLuc: e.target.value})} 
                  />
                </div>
                
                <div className="form-group half">
                  <label>Trạng thái</label>
                  <select 
                    value={formData.trangThai} 
                    onChange={(e) => setFormData({...formData, trangThai: e.target.value})}
                  >
                    <option value="1">Còn hiệu lực</option>
                    <option value="2">Hết hiệu lực</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label><Download size={14} className="inline mr-1" />File đính kèm (PDF, DOCX)</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                />
                {!formData.fileDinhKem && formData.id && (
                  <span className="file-hint text-amber-600 text-sm mt-1 block">
                    (Đã có file trên hệ thống. Chỉ chọn file mới nếu muốn thay thế)
                  </span>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save" disabled={uploading}>
                  {uploading ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default VanBanPage;
