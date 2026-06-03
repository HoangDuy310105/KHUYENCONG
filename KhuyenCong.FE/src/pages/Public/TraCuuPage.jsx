import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import api from '../../services/api';
import './TraCuuPage.css';

const DOC_TYPES = [
  'Tất cả', 'Luật, pháp lệnh', 'Nghị định', 'Nghị quyết', 
  'Hiệp định quốc tế', 'Quyết định', 'Chỉ thị', 'Báo cáo', 
  'Văn bản khác', 'Công văn', 'Thông tư'
];

const STATUSES = ['Tất cả', 'Còn hiệu lực', 'Hết hiệu lực', 'Hết hiệu lực một phần'];

const getAgencyFromCode = (code) => {
  if (!code) return 'Cơ quan có thẩm quyền';
  const c = code.toUpperCase();
  if (c.includes('QH')) return 'Quốc hội';
  if (c.includes('CP')) return 'Chính phủ';
  if (c.includes('BTC')) return 'Bộ Tài chính';
  if (c.includes('BCT')) return 'Bộ Công Thương';
  if (c.includes('BKHĐT') || c.includes('BKHDT')) return 'Bộ Kế hoạch và Đầu tư';
  return 'Cơ quan có thẩm quyền';
};

const TraCuuPage = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [docType, setDocType] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  
  // Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, [page, searchTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // API call to backend, fetching max data to filter on client if backend doesn't support full filtering
      const res = await api.get(`/van-ban?page=${page}&pageSize=1000&keyword=${searchTrigger}`);
      const data = res.data;
      if (data && (data.items || data.Items)) {
        setDocs(data.items || data.Items);
        setTotalCount(data.totalCount || data.TotalCount || 0);
      } else if (Array.isArray(data)) {
        setDocs(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error('Lỗi khi lấy văn bản:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      setSearchTrigger(searchTerm);
    }
  };

  // Client-side filtering as fallback for complex status/type filters
  const filteredDocs = docs.filter(doc => {
    if (status === 'Còn hiệu lực' && doc.trangThai !== 1 && doc.trangThai !== 0) return false;
    if (status === 'Hết hiệu lực' && doc.trangThai !== 2) return false;
    if (status === 'Hết hiệu lực một phần' && doc.trangThai !== 3) return false;
    
    if (docType !== 'Tất cả') {
      const typeStr = docType.toLowerCase();
      if (!doc.trichYeu?.toLowerCase().includes(typeStr) && !doc.soKyHieu?.toLowerCase().includes(typeStr)) {
        return false;
      }
    }
    return true;
  });

  // Client side pagination logic
  const currentTotal = filteredDocs.length;
  const totalPages = Math.ceil(currentTotal / pageSize) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * pageSize;
  const currentItems = filteredDocs.slice(startIndex, startIndex + pageSize);

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7) {
        if (i !== 1 && i !== totalPages && Math.abs(i - safePage) > 1) {
          if (i === safePage - 2 || i === safePage + 2) {
            pages.push(<span key={i} className="tc-page-ellipsis">...</span>);
          }
          continue;
        }
      }
      pages.push(
        <button 
          key={i} 
          className={`tc-page-btn ${safePage === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="tra-cuu-page animate-fade-in">
      <div className="tc-container">
        
        {/* Breadcrumb */}
        <div className="tc-breadcrumb">
          <a href="/">Trang chủ</a>
          <span className="separator">&gt;</span>
          <span className="current">Văn bản pháp quy</span>
        </div>

        {/* Header & Search */}
        <div className="tc-header-row">
          <h1 className="tc-title">Văn bản pháp quy</h1>
          <div className="tc-search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm văn bản" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button onClick={() => { setPage(1); setSearchTrigger(searchTerm); }}>
              <Search size={18} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="tc-filter-row">
          <div className="tc-filter-item">
            <label>Loại văn bản:</label>
            <div className="tc-select-wrap">
              <select value={docType} onChange={e => { setDocType(e.target.value); setPage(1); }}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          <div className="tc-filter-item">
            <label>Tình trạng:</label>
            <div className="tc-select-wrap">
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                {STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="tc-list">
          {loading ? (
            <div className="tc-loading">Đang tải dữ liệu...</div>
          ) : currentItems.length === 0 ? (
            <div className="tc-empty">
              <FileText size={48} color="#cbd5e1" />
              <p>Không tìm thấy văn bản pháp quy phù hợp.</p>
            </div>
          ) : (
            currentItems.map(doc => {
              const isConHieuLuc = doc.trangThai === 1 || doc.trangThai === 0;
              const isHetHieuLuc = doc.trangThai === 2;
              const isMotPhan = doc.trangThai === 3;
              
              let badgeClass = 'badge-con';
              let badgeText = 'Còn hiệu lực';
              if (isHetHieuLuc) {
                badgeClass = 'badge-het';
                badgeText = 'Hết hiệu lực';
              } else if (isMotPhan) {
                badgeClass = 'badge-mot-phan';
                badgeText = 'Hết hiệu lực một phần';
              }

              return (
                <div key={doc.id} className="tc-card" onClick={() => { setSelectedDoc(doc); setIsModalOpen(true); }}>
                  <div className="tc-card-top">
                    <span className="tc-card-so">Số: {doc.soKyHieu}</span>
                    <span className={`tc-badge ${badgeClass}`}>{badgeText}</span>
                  </div>
                  
                  <h3 className="tc-card-title">
                    {doc.trichYeu}
                  </h3>
                  
                  <div className="tc-card-meta">
                    <div className="meta-col">
                      <span className="meta-label">Hiệu lực</span>
                      <span className="meta-val">{doc.ngayHieuLuc ? new Date(doc.ngayHieuLuc).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</span>
                    </div>
                    <div className="meta-col">
                      <span className="meta-label">Cơ quan ban hành</span>
                      <span className="meta-val">{getAgencyFromCode(doc.soKyHieu)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="tc-pagination">
            <button 
              className="tc-page-nav" 
              disabled={safePage === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {renderPagination()}
            <button 
              className="tc-page-nav" 
              disabled={safePage === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>

      {/* Modal Chi tiết */}
      {isModalOpen && selectedDoc && (
        <div className="tc-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="tc-modal" onClick={e => e.stopPropagation()}>
            <button className="tc-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            
            <div className="tc-modal-header">
              <span className="tc-modal-so">Số: {selectedDoc.soKyHieu}</span>
              <span className={`tc-badge ${selectedDoc.trangThai === 2 ? 'badge-het' : (selectedDoc.trangThai === 3 ? 'badge-mot-phan' : 'badge-con')}`}>
                {selectedDoc.trangThai === 2 ? 'Hết hiệu lực' : (selectedDoc.trangThai === 3 ? 'Hết hiệu lực một phần' : 'Còn hiệu lực')}
              </span>
            </div>

            <h2 className="tc-modal-title">{selectedDoc.trichYeu}</h2>

            <div className="tc-modal-grid">
              <div className="tc-modal-col">
                <span className="tc-modal-label">Cơ quan ban hành</span>
                <span className="tc-modal-val">{getAgencyFromCode(selectedDoc.soKyHieu)}</span>
              </div>
              <div className="tc-modal-col">
                <span className="tc-modal-label">Người ký</span>
                <span className="tc-modal-val">{selectedDoc.nguoiKy || '—'}</span>
              </div>
              <div className="tc-modal-col">
                <span className="tc-modal-label">Ngày ban hành</span>
                <span className="tc-modal-val">
                  {selectedDoc.ngayHieuLuc ? new Date(new Date(selectedDoc.ngayHieuLuc).getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="tc-modal-col">
                <span className="tc-modal-label">Ngày hiệu lực</span>
                <span className="tc-modal-val">
                  {selectedDoc.ngayHieuLuc ? new Date(selectedDoc.ngayHieuLuc).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>

            <div className="tc-modal-file">
              <div className="tc-file-info">
                <span className="tc-file-label">File đính kèm</span>
                <span className="tc-file-name">{selectedDoc.fileDinhKem ? selectedDoc.fileDinhKem.split('/').pop() : 'Thong_tu_ban_hanh.rar'}</span>
              </div>
              <a href={selectedDoc.fileDinhKem || '#'} target="_blank" rel="noreferrer" className="tc-btn-download">
                Tải xuống
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraCuuPage;
