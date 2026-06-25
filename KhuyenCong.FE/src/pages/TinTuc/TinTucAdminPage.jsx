import { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, Edit, Trash2, CheckCircle, XCircle, Image as ImageIcon, Flame 
} from 'lucide-react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import '../VanBan/VanBan.css'; // Reusing VanBan CSS for layout consistency
import './TinTucAdmin.css'; // Premium modal styles

function TinTucAdminPage() {
  const { showAlert, showConfirm } = useDialog();
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
    title: '',
    excerpt: '',
    content: '',
    category: 'Thông báo',
    imageUrl: '',
    isHot: false,
    status: 1
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [page, keyword]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tin-tuc?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`);
      if (res.data) {
        setData(res.data.items || res.data.Items || []);
        setTotalCount(res.data.totalCount || res.data.TotalCount || 0);
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
        title: item.title,
        excerpt: item.excerpt,
        content: item.content || '',
        category: item.category || 'Thông báo',
        imageUrl: item.imageUrl || '',
        isHot: item.isHot || false,
        status: item.status !== undefined ? item.status : 1
      });
    } else {
      setFormData({
        id: null,
        title: '',
        excerpt: '',
        content: '',
        category: 'Thông báo',
        imageUrl: '',
        isHot: false,
        status: 1
      });
    }
    setImageFile(null);
    setShowModal(true);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt) {
      showAlert('Lỗi', 'Vui lòng nhập đủ Tiêu đề và Trích yếu.', 'danger');
      return;
    }
    
    setUploading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload hình ảnh nếu có chọn file mới
      if (imageFile) {
        const fileData = new FormData();
        fileData.append('file', imageFile);
        const uploadRes = await api.post('/file/upload', fileData);
        
        const path = uploadRes.data?.path || uploadRes.data?.url || uploadRes.data;
        finalImageUrl = typeof path === 'object' ? (path.fileUrl || path.url) : path;
      }
      
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        imageUrl: finalImageUrl,
        isHot: formData.isHot,
        status: Number(formData.status),
      };
      
      if (formData.id) {
        await api.put(`/tin-tuc/${formData.id}`, payload);
      } else {
        await api.post('/tin-tuc', payload);
      }
      
      setShowModal(false);
      fetchData();
      showAlert('Thành công', 'Lưu tin tức thành công!', 'success');
    } catch (error) {
      showAlert('Lỗi', 'Lỗi: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm("Xác nhận xóa", 'Bạn có chắc chắn muốn xóa tin tức này?', "warning");
    if (isConfirmed) {
      try {
        await api.delete(`/tin-tuc/${id}`);
        fetchData();
        showAlert('Thành công', 'Đã xóa tin tức thành công!', 'success');
      } catch (error) {
        showAlert('Lỗi', 'Lỗi khi xóa: ' + (error.response?.data?.message || error.message), 'danger');
      }
    }
  };

  return (
    <div className="vanban-container">
      <div className="vanban-header">
        <div className="header-title">
          <FileText size={24} className="title-icon" />
          <h2>Quản lý Tin tức & Thông báo</h2>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo Tiêu đề, Trích yếu..." 
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
      
      {/* Bảng dữ liệu */}
      <div className="vanban-content mt-4">
        <div className="table-responsive">
          <table className="vanban-table">
            <thead>
              <tr>
                <th width="5%">STT</th>
                <th width="15%">Danh mục</th>
                <th width="35%">Tiêu đề</th>
                <th width="15%">Ngày đăng</th>
                <th width="10%">Nổi bật</th>
                <th width="10%">Trạng thái</th>
                <th width="10%">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Chưa có bài viết nào.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{(page - 1) * pageSize + index + 1}</td>
                    <td className="font-semibold text-navy">{item.category}</td>
                    <td>{item.title}</td>
                    <td className="text-center">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="text-center">
                      {item.isHot ? (
                        <span className="badge badge-warning" style={{backgroundColor: '#fffbeb', color: '#d97706'}}>
                          <Flame size={12} className="mr-1"/> Nổi bật
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {item.status === 1 ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} className="mr-1"/> Hiển thị
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          <XCircle size={12} className="mr-1"/> Ẩn
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
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

      {/* Modal Thêm/Sửa - Premium Design */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card news-modal-card">
            <div className="modal-header news-modal-header">
              <h3>
                <FileText size={22} className="text-white" />
                {formData.id ? 'Cập nhật Tin tức' : 'Thêm mới Tin tức'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body news-modal-body">
              
              {/* Section 1: Basic Info */}
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fa-solid fa-circle-info"></i> Thông tin cơ bản
                </div>
                <div className="form-group mb-4">
                  <label className="premium-label">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="premium-input"
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required 
                    placeholder="Nhập tiêu đề hấp dẫn cho tin tức..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label className="premium-label">Danh mục phân loại</label>
                    <select 
                      className="premium-input"
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Thông báo">Thông báo</option>
                      <option value="Quyết định">Quyết định</option>
                      <option value="Hướng dẫn">Hướng dẫn</option>
                      <option value="Sự kiện">Sự kiện</option>
                      <option value="Chính sách">Chính sách</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label className="premium-label">Trạng thái hiển thị</label>
                    <select 
                      className="premium-input"
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="1">Hiển thị công khai</option>
                      <option value="0">Lưu bản nháp (Ẩn)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Section 2: Content */}
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fa-solid fa-align-left"></i> Nội dung bài viết
                </div>
                <div className="form-group mb-4">
                  <label className="premium-label">Trích yếu (Tóm tắt ngắn) <span className="text-red-500">*</span></label>
                  <textarea 
                    className="premium-input"
                    value={formData.excerpt} 
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
                    required
                    rows="2"
                    placeholder="Nhập đoạn tóm tắt ngắn gọn thu hút người đọc..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="premium-label">Nội dung chi tiết</label>
                  <textarea 
                    className="premium-input"
                    value={formData.content} 
                    onChange={(e) => setFormData({...formData, content: e.target.value})} 
                    rows="4"
                    placeholder="Viết nội dung đầy đủ của bài báo tại đây..."
                  ></textarea>
                </div>
              </div>
              
              {/* Section 3: Media & Options */}
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fa-solid fa-image"></i> Hình ảnh & Trưng bày
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label className="premium-label">Ảnh đại diện (Thumbnail)</label>
                    <label className="upload-zone">
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*"
                      />
                      <div className="upload-icon">
                        <ImageIcon size={24} />
                      </div>
                      <span className="upload-text">
                        {imageFile ? imageFile.name : 'Kéo thả hoặc bấm để chọn ảnh'}
                      </span>
                      <span className="upload-subtext">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</span>
                    </label>

                    {(formData.imageUrl || imageFile) && (
                      <div className="image-preview">
                        {imageFile ? (
                          <img src={URL.createObjectURL(imageFile)} alt="Preview" />
                        ) : (
                          <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:9000/${formData.imageUrl}`} alt="Current Thumbnail" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group half" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div className="toggle-wrapper">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={formData.isHot}
                          onChange={(e) => setFormData({...formData, isHot: e.target.checked})} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <div className="toggle-label-content">
                        <span className="toggle-title">Đánh dấu Tin nổi bật</span>
                        <span className="toggle-desc">Sẽ được ghim lên đầu trang với nhãn "Nổi bật" màu vàng cam.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer news-modal-footer">
                <button type="button" className="btn-premium-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-premium-save" disabled={uploading}>
                  {uploading ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk"></i> Xuất bản bài viết</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TinTucAdminPage;
