import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Building2, ShieldCheck, Mail } from 'lucide-react';
import api from '../../services/api';
import './ProfilePage.css';

const ROLE_NAMES = {
    1: 'Cơ sở Công nghiệp nông thôn',
    2: 'Sở Công Thương',
    3: 'Bộ / Cục Công Thương',
    4: 'Quản trị viên (Admin)',
    5: 'Trung tâm Khuyến công'
};

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [pwdForm, setPwdForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
    const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });
    
    const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/Auth/me');
                setProfile(res.data);
            } catch (error) {
                console.error("Lỗi khi tải thông tin cá nhân:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePwdChange = (e) => {
        setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
    };

    const toggleShowPwd = (field) => {
        setShowPwd({ ...showPwd, [field]: !showPwd[field] });
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setAlertMsg({ type: '', text: '' });
        
        if (pwdForm.matKhauMoi !== pwdForm.xacNhanMatKhau) {
            setAlertMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
            return;
        }
        
        if (pwdForm.matKhauMoi.length < 6) {
            setAlertMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/Auth/doi-mat-khau', {
                matKhauCu: pwdForm.matKhauCu,
                matKhauMoi: pwdForm.matKhauMoi
            });
            setAlertMsg({ type: 'success', text: res.data.message || 'Đổi mật khẩu thành công!' });
            setPwdForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
        } catch (error) {
            setAlertMsg({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải thông tin...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title"><User size={28} color="#1d4ed8" /> HỒ SƠ CÁ NHÂN</h1>
                <p className="profile-subtitle">Quản lý thông tin tài khoản và bảo mật</p>
            </div>

            <div className="profile-grid">
                {/* Cột 1: Thông tin cá nhân */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <ShieldCheck size={20} color="#0f172a" />
                        <h2>Thông tin tài khoản</h2>
                    </div>
                    <div className="profile-card-body">
                        {profile ? (
                            <div className="info-list">
                                <div className="info-item">
                                    <span className="info-label">Tên đăng nhập</span>
                                    <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} color="#64748b" />
                                        {profile.username}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Vai trò (Role)</span>
                                    <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 600 }}>
                                        <ShieldCheck size={16} />
                                        {ROLE_NAMES[profile.role] || 'Không xác định'}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Trạng thái</span>
                                    <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                                        <CheckCircle size={16} />
                                        Đang hoạt động
                                    </div>
                                </div>
                                {profile.donViId && (
                                    <div className="info-item">
                                        <span className="info-label">Đơn vị trực thuộc</span>
                                        <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Building2 size={16} color="#64748b" />
                                            {profile.donViId} {/* Bạn có thể gọi thêm API lấy tên đơn vị nếu cần */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8' }}>Không thể tải thông tin.</div>
                        )}
                    </div>
                </div>

                {/* Cột 2: Đổi mật khẩu */}
                <div className="profile-card">
                    <div className="profile-card-header">
                        <Lock size={20} color="#0f172a" />
                        <h2>Đổi mật khẩu</h2>
                    </div>
                    <div className="profile-card-body">
                        <form className="profile-form" onSubmit={handleSubmitPassword}>
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPwd.old ? "text" : "password"} 
                                        name="matKhauCu"
                                        value={pwdForm.matKhauCu}
                                        onChange={handlePwdChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        required
                                    />
                                    <button type="button" className="btn-toggle-password" onClick={() => toggleShowPwd('old')}>
                                        {showPwd.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPwd.new ? "text" : "password"} 
                                        name="matKhauMoi"
                                        value={pwdForm.matKhauMoi}
                                        onChange={handlePwdChange}
                                        placeholder="Nhập mật khẩu mới"
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" className="btn-toggle-password" onClick={() => toggleShowPwd('new')}>
                                        {showPwd.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPwd.confirm ? "text" : "password"} 
                                        name="xacNhanMatKhau"
                                        value={pwdForm.xacNhanMatKhau}
                                        onChange={handlePwdChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" className="btn-toggle-password" onClick={() => toggleShowPwd('confirm')}>
                                        {showPwd.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-password" disabled={isSubmitting || !pwdForm.matKhauCu || !pwdForm.matKhauMoi || !pwdForm.xacNhanMatKhau}>
                                {isSubmitting ? 'Đang xử lý...' : 'Lưu Thay Đổi'}
                            </button>
                        </form>

                        {alertMsg.text && (
                            <div className={`alert-message ${alertMsg.type}`}>
                                {alertMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {alertMsg.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
