import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Clock, CheckCircle, PlusCircle, AlertCircle, Award, Star, Package } from 'lucide-react';
import './DashboardPage.css';

function CoSoDashboard() {
  const navigate = useNavigate();
  const [myDeAns, setMyDeAns] = useState([]);
  const [myOcops, setMyOcops] = useState([]);
  
  useEffect(() => {
    const userDonViId = localStorage.getItem('donViId');

    // Fetch Đề Án
    api.get('/dean?page=1&pageSize=50').then(res => {
      const allDa = res.data?.Items || res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setMyDeAns(allDa.filter(d => 
        (d.donViThuHuongId && userDonViId && d.donViThuHuongId.toLowerCase() === userDonViId.toLowerCase()) || 
        (d.donViThiCongId && userDonViId && d.donViThiCongId.toLowerCase() === userDonViId.toLowerCase())
      ));
    }).catch(err => console.error(err));

    // Fetch OCOP
    api.get('/SanPhamOcop?page=1&pageSize=50').then(res => {
      const allOcop = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      // So sánh không phân biệt hoa thường để tránh lỗi GUID
      setMyOcops(allOcop.filter(o => o.donViId && userDonViId && o.donViId.toLowerCase() === userDonViId.toLowerCase()));
    }).catch(err => console.error(err));
  }, []);

  const countDraft = myDeAns.filter(x => x.trangThai === 0 || x.trangThai === 3).length;
  const countPending = myDeAns.filter(x => x.trangThai === 1 || x.trangThai === 2).length;
  const countApproved = myDeAns.filter(x => x.trangThai >= 5).length;

  const countOcopDraft = myOcops.filter(x => x.trangThai === 0).length;
  const countOcopPending = myOcops.filter(x => x.trangThai === 1).length;
  const countOcopApproved = myOcops.filter(x => x.trangThai >= 2).length;
  
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="db-container">
      <div className="db-header coso-header-layout">
        <div>
          <h1 className="db-title" style={{ color: '#166534' }}>
            CỔNG THÔNG TIN CƠ SỞ CÔNG NGHIỆP NÔNG THÔN
          </h1>
          <p className="db-subtitle">Theo dõi và quản lý hồ sơ đề nghị hỗ trợ kinh phí khuyến công</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/ocop')} className="btn-create-proposal" style={{ backgroundColor: '#d97706', boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.4)' }}>
            <Award size={20} />
            QUẢN LÝ OCOP
          </button>
          <button onClick={() => navigate('/de-an/tao-moi')} className="btn-create-proposal" style={{ backgroundColor: '#0f172a', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.4)' }}>
            <PlusCircle size={20} />
            TẠO ĐỀ XUẤT MỚI
          </button>
        </div>
      </div>

      <div className="db-grid-3">
        <div className="stat-card gray">
          <div className="stat-info">
            <p className="stat-label">HỒ SƠ NHÁP / CẦN BỔ SUNG</p>
            <p className="stat-value">{countDraft}</p>
          </div>
          <div className="stat-icon gray"><FileText size={24} /></div>
        </div>

        <div className="stat-card orange">
          <div className="stat-info">
            <p className="stat-label">ĐANG CHỜ THẨM ĐỊNH</p>
            <p className="stat-value">{countPending}</p>
          </div>
          <div className="stat-icon orange"><Clock size={24} /></div>
        </div>

        <div className="stat-card green">
          <div className="stat-info">
            <p className="stat-label">ĐÃ ĐƯỢC PHÊ DUYỆT</p>
            <p className="stat-value">{countApproved}</p>
          </div>
          <div className="stat-icon green"><CheckCircle size={24} /></div>
        </div>
      </div>

      <h3 className="section-title"><Award size={20}/> TIẾN ĐỘ & CHỨNG NHẬN OCOP</h3>
      <div className="db-grid-3">
        <div className="stat-card" style={{ borderLeftColor: '#94a3b8' }}>
          <div className="stat-info">
            <p className="stat-label">SẢN PHẨM NHÁP</p>
            <p className="stat-value">{countOcopDraft}</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}><Package size={24} /></div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-info">
            <p className="stat-label">ĐANG DỰ THI</p>
            <p className="stat-value">{countOcopPending}</p>
          </div>
          <div className="stat-icon blue"><Clock size={24} /></div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#d97706' }}>
          <div className="stat-info">
            <p className="stat-label">ĐẠT CHỨNG NHẬN</p>
            <p className="stat-value" style={{ color: '#d97706' }}>{countOcopApproved}</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}><Star size={24} /></div>
        </div>
      </div>

      <div className="db-grid-2-custom">
        <div className="table-panel">
          <div className="table-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FileText size={18} /> Đề án mới nhất
            </h3>
          <button onClick={() => navigate('/de-an')} className="btn-link" style={{ color: '#15803d' }}>
            Xem toàn bộ &rarr;
          </button>
        </div>
        <div className="table-responsive">
          <table className="db-table">
            <thead>
              <tr>
                <th>Mã Hồ Sơ</th>
                <th>Tên Đề Án</th>
                <th className="th-right">Kinh phí đề nghị</th>
                <th>Trạng thái</th>
                <th className="th-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {myDeAns.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    <AlertCircle size={48} style={{ margin: '0 auto 12px auto', opacity: 0.2 }} />
                    Bạn chưa nộp hồ sơ đề xuất nào.
                  </td>
                </tr>
              ) : (
                myDeAns.map(item => (
                  <tr key={item.id}>
                    <td className="td-id">{item.maDeAn || 'Chưa cấp mã'}</td>
                    <td className="td-name">{item.tenDeAn}</td>
                    <td className="td-money">{formatCurrency(item.kinhPhiDuKien)}</td>
                    <td>
                      <span className={`status-badge ${
                        item.trangThai === 0 ? 'gray' :
                        item.trangThai === 1 || item.trangThai === 2 ? 'orange' :
                        item.trangThai === 3 ? 'red' : 'green'
                      }`}>
                        {item.trangThai === 0 ? 'Lưu nháp' :
                         item.trangThai === 1 ? 'Chờ Sở thẩm định' :
                         item.trangThai === 2 ? 'Chờ Bộ phê duyệt' :
                         item.trangThai === 3 ? 'Cần bổ sung' :
                         item.trangThai === 5 ? 'Đã phê duyệt' :
                         item.trangThai === 6 ? 'Đang thực hiện' : 'Khác'}
                      </span>
                    </td>
                    <td className="td-center">
                      <button onClick={() => navigate(`/de-an`)} className="btn-action" style={{ color: '#15803d', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-panel">
          <div className="table-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#d97706' }}>
              <Award size={18} /> Sản phẩm OCOP/CNNT
            </h3>
            <button onClick={() => navigate('/ocop')} className="btn-link" style={{ color: '#d97706' }}>
              Xem toàn bộ &rarr;
            </button>
          </div>
          <div className="table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Tên Sản Phẩm</th>
                  <th>Cấp Chứng Nhận</th>
                  <th className="th-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myOcops.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <AlertCircle size={48} style={{ margin: '0 auto 12px auto', opacity: 0.2 }} />
                      Chưa có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  myOcops.slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td className="td-name" style={{ fontWeight: 600 }}>{item.tenSanPham}</td>
                      <td>
                        <span className="info-tag" style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#fef3c7', color: '#b45309', borderRadius: '4px' }}>
                          {item.capChungNhan || 'Cấp Tỉnh'}
                        </span>
                      </td>
                      <td className="td-center">
                        <span className={`status-badge ${
                          item.trangThai === 0 ? 'gray' :
                          item.trangThai === 1 ? 'blue' : 'green'
                        }`}>
                          {item.trangThai === 0 ? 'Lưu nháp' :
                           item.trangThai === 1 ? 'Đang dự thi' : 'Đạt chứng nhận'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoSoDashboard;
