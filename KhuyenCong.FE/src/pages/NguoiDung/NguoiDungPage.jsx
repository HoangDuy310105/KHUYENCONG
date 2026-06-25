import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Lock, Unlock, Inbox } from 'lucide-react';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import './NguoiDung.css';

const ROLE_MAP = {
  1: { label: 'Cơ sở CNNT', bg: '#dcfce7', color: '#166534' },
  2: { label: 'Sở Công Thương', bg: '#ffedd5', color: '#9a3412' },
  3: { label: 'Bộ Công Thương (Admin)', bg: '#f3e8ff', color: '#6b21a8' },
  4: { label: 'Quản trị viên', bg: '#e2e8f0', color: '#475569' },
  5: { label: 'TT Khuyến công', bg: '#e0f2fe', color: '#075985' }
};

function NguoiDungPage() {
  const { showAlert, showConfirm } = useDialog();
  const [users, setUsers] = useState([]);
  const [donVis, setDonVis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 1,
    donViId: '',
    isActive: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nguoi-dung');
      setUsers(res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonVis = async () => {
    try {
      const res = await api.get('/donvi?page=1&pageSize=1000');
      setDonVis(res.data.items || res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách đơn vị:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDonVis();
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.tenDonVi && u.tenDonVi.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (user = null) => {
    if (user && typeof user === 'object' && user.id) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        password: '', 
        role: user.role || 1,
        donViId: user.donViId || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: 1,
        donViId: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        username: formData.username,
        role: Number(formData.role),
        donViId: formData.donViId ? formData.donViId : null,
        isActive: formData.isActive
      };

      if (editingUser) {
        // Cập nhật (PUT)
        await api.put(`/nguoi-dung/${editingUser.id}`, payload);
      } else {
        // Tạo mới (POST)
        payload.password = formData.password;
        await api.post('/nguoi-dung', payload);
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      showAlert("Lỗi", "Có lỗi xảy ra: " + (error.response?.data?.message || error.message), "danger");
    }
  };

  const handleToggleStatus = async (user) => {
    const isConfirmed = await showConfirm(
      "Xác nhận", 
      `Bạn có chắc muốn ${user.isActive ? 'Khóa' : 'Mở khóa'} tài khoản ${user.username}?`, 
      "warning"
    );
    if (isConfirmed) {
      try {
        const payload = { ...user, isActive: !user.isActive };
        await api.put(`/nguoi-dung/${user.id}`, payload);
        fetchUsers();
      } catch (error) {
        showAlert("Lỗi", "Lỗi khi thay đổi trạng thái!", "danger");
      }
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm(
      "Xác nhận xóa", 
      "Bạn có chắc chắn muốn xóa tài khoản này?", 
      "warning"
    );
    if (isConfirmed) {
      try {
        await api.delete(`/nguoi-dung/${id}`);
        fetchUsers();
      } catch (error) {
        showAlert("Lỗi", "Lỗi khi xóa tài khoản!", "danger");
      }
    }
  };

  return (
    <div className="nd-container">
      {/* HEADER SECTION */}
      <div className="nd-header">
        <div className="nd-title-section">
          <div className="nd-icon-wrapper">
            <Users size={24} />
          </div>
          <div>
            <h2>Quản lý Người dùng</h2>
            <div className="nd-subtitle">Hệ thống phân quyền & quản trị tài khoản truy cập</div>
          </div>
        </div>

        <div className="nd-actions">
          <div className="nd-search">
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm tài khoản, đơn vị..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="nd-content">
        <table className="nd-table">
          <thead>
            <tr>
              <th width="5%">STT</th>
              <th width="20%">Tên đăng nhập</th>
              <th width="30%">Đơn vị trực thuộc</th>
              <th width="15%">Vai trò</th>
              <th width="15%">Trạng thái</th>
              <th width="15%">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td><div className="skeleton-box" style={{ width: '20px' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '80%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '60%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '70%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '50%' }}></div></td>
                  <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <Inbox size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto' }} />
                  <h4 style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy tài khoản nào</h4>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => {
                const role = ROLE_MAP[user.role] || ROLE_MAP[1];
                return (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td>{user.tenDonVi || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không trực thuộc đơn vị nào</span>}</td>
                    <td>
                      <span className="user-role-badge" style={{ backgroundColor: role.bg, color: role.color }}>
                        {role.label}
                      </span>
                    </td>
                    <td>
                      <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="nd-action-buttons">
                        <button className="btn-icon" title="Chỉnh sửa" onClick={() => handleOpenModal(user)}>
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title={user.isActive ? "Khóa tài khoản" : "Mở khóa"} 
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button 
                          className="btn-icon delete" 
                          title="Xóa vĩnh viễn"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <div className="nd-modal-overlay" onClick={handleCloseModal}>
          <div className="nd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nd-modal-header">
              <h3>{editingUser ? 'Chỉnh sửa Tài khoản' : 'Thêm Tài khoản mới'}</h3>
              <button className="nd-modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <div className="nd-modal-body">
              <div className="nd-form-group">
                <label>Tên đăng nhập *</label>
                <input 
                  type="text" 
                  className="nd-form-control" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!editingUser}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              {!editingUser && (
                <div className="nd-form-group">
                  <label>Mật khẩu *</label>
                  <input 
                    type="password" 
                    className="nd-form-control" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Mật khẩu tạo mới"
                  />
                </div>
              )}

              <div className="nd-form-group">
                <label>Vai trò *</label>
                <select 
                  className="nd-form-control"
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = Number(e.target.value);
                    const newDonViId = (newRole === 3 || newRole === 4) ? '' : formData.donViId;
                    setFormData({...formData, role: newRole, donViId: newDonViId});
                  }}
                >
                  {Object.entries(ROLE_MAP).map(([key, r]) => (
                    <option key={key} value={key}>{r.label}</option>
                  ))}
                </select>
              </div>

              {formData.role !== 3 && formData.role !== 4 && (
                <div className="nd-form-group">
                  <label>Đơn vị trực thuộc (Tùy chọn)</label>
                  <select 
                    className="nd-form-control"
                    value={formData.donViId || ''}
                    onChange={(e) => setFormData({...formData, donViId: e.target.value})}
                  >
                    <option value="">-- Không trực thuộc đơn vị nào --</option>
                    {(Array.isArray(donVis) ? donVis : []).map(dv => (
                      <option key={dv.id} value={dv.id}>{dv.tenDonVi}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="nd-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isActiveToggle" style={{ margin: 0, cursor: 'pointer' }}>Kích hoạt tài khoản</label>
              </div>
            </div>

            <div className="nd-modal-footer">
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

export default NguoiDungPage;
