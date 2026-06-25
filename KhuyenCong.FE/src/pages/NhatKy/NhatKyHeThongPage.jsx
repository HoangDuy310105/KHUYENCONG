import { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, RefreshCw, Inbox } from 'lucide-react';
import './NhatKy.css';

function NhatKyHeThongPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/lichsuthaotac');
            setLogs(res.data);
        } catch (error) {
            console.error('Lỗi khi tải nhật ký:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getTrangThaiBadge = (trangThai) => {
        if (trangThai === null || trangThai === undefined) return '-';
        switch (trangThai) {
            case 0: return <span className="nk-badge secondary">Lưu nháp</span>;
            case 1: return <span className="nk-badge warning">Chờ Sở duyệt</span>;
            case 2: return <span className="nk-badge warning">Chờ Cục thẩm định</span>;
            case 3: return <span className="nk-badge error">Yêu cầu bổ sung</span>;
            case 4: return <span className="nk-badge error">Bị từ chối</span>;
            case 5: return <span className="nk-badge success">Đã phê duyệt</span>;
            case 6: return <span className="nk-badge info">Đang thực hiện</span>;
            case 7: return <span className="nk-badge success">Đã nghiệm thu</span>;
            case 8: return <span className="nk-badge success">Đã quyết toán</span>;
            default: return <span className="nk-badge secondary">KXĐ</span>;
        }
    };

    return (
        <div className="nk-container">
            {/* HEADER SECTION */}
            <div className="nk-header">
                <div className="nk-title-section">
                    <div className="nk-icon-wrapper">
                        <History size={24} />
                    </div>
                    <div>
                        <h2>Nhật ký hệ thống (Audit Log)</h2>
                        <div className="nk-subtitle">Lưu vết các thao tác thay đổi trạng thái và giải ngân đề án.</div>
                    </div>
                </div>

                <button className="btn-refresh" onClick={fetchLogs}>
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    Tải lại
                </button>
            </div>

            {/* DATA TABLE */}
            <div className="nk-content">
                <table className="nk-table">
                    <thead>
                        <tr>
                            <th width="15%">Thời gian</th>
                            <th width="15%">Người dùng</th>
                            <th width="25%">Đề án</th>
                            <th width="15%">Hành động</th>
                            <th width="10%">Trạng thái cũ</th>
                            <th width="10%">Trạng thái mới</th>
                            <th width="10%">Lý do / Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="skeleton-row">
                                    <td><div className="skeleton-box" style={{ width: '80%' }}></div></td>
                                    <td><div className="skeleton-box" style={{ width: '60%' }}></div></td>
                                    <td><div className="skeleton-box" style={{ width: '90%' }}></div></td>
                                    <td><div className="skeleton-box" style={{ width: '70%' }}></div></td>
                                    <td><div className="skeleton-box" style={{ width: '50%' }}></div></td>
                                    <td><div className="skeleton-box" style={{ width: '50%' }}></div></td>
                                    <td><div className="skeleton-box" style={{ width: '40%' }}></div></td>
                                </tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                    <Inbox size={48} style={{ opacity: 0.3, margin: '0 auto 16px auto', color: '#8b5cf6' }} />
                                    <h4 style={{ margin: 0, fontWeight: 600, color: '#334155' }}>Không có lịch sử thao tác nào</h4>
                                    <p style={{ marginTop: '8px', color: '#64748b', fontSize: '14px' }}>Hệ thống chưa ghi nhận thao tác duyệt hay giải ngân nào.</p>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ fontWeight: 500, color: '#475569' }}>
                                        {new Intl.DateTimeFormat('vi-VN', {
                                            hour: '2-digit', minute: '2-digit',
                                            day: '2-digit', month: '2-digit', year: 'numeric'
                                        }).format(new Date(log.createdAt))}
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{log.tenNguoiDung}</td>
                                    <td>{log.tenDeAn || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có</span>}</td>
                                    <td style={{ fontWeight: 600 }}>{log.hanhDong}</td>
                                    <td>{getTrangThaiBadge(log.trangThaiCu)}</td>
                                    <td>{getTrangThaiBadge(log.trangThaiMoi)}</td>
                                    <td style={{ color: '#64748b' }}>{log.lyDo || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default NhatKyHeThongPage;
