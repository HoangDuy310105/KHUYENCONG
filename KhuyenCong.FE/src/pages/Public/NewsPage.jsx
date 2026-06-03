import React, { useState } from 'react';
import './NewsPage.css';

/* ── Dữ liệu mẫu ── */
const NEWS_CATEGORIES = ['Tất cả', 'Thông báo', 'Quyết định', 'Hướng dẫn', 'Sự kiện', 'Chính sách'];

// Dữ liệu mẫu đã được chuyển vào Database.

/* ── Màu tag theo danh mục ── */
const CATEGORY_COLOR = {
  'Thông báo': { bg: 'rgba(26,45,86,0.12)', text: '#1a2d56', border: 'rgba(26,45,86,0.3)' },
  'Quyết định': { bg: 'rgba(220,38,38,0.1)', text: '#b91c1c', border: 'rgba(220,38,38,0.3)' },
  'Hướng dẫn': { bg: 'rgba(5,150,105,0.1)', text: '#047857', border: 'rgba(5,150,105,0.3)' },
  'Sự kiện': { bg: 'rgba(124,58,237,0.1)', text: '#6d28d9', border: 'rgba(124,58,237,0.3)' },
  'Chính sách': { bg: 'rgba(212,150,10,0.12)', text: '#92680a', border: 'rgba(212,150,10,0.4)' },
};

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');
  
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchData();
  }, [page, activeCategory, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoryParam = activeCategory !== 'Tất cả' ? activeCategory : '';
      const response = await fetch(`/api/tin-tuc?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(search)}&category=${encodeURIComponent(categoryParam)}`);
      const resData = await response.json();
      
      // Handle the case where the backend uses items or Items due to JSON serialization
      setData(resData.items || resData.Items || []);
      setTotalCount(resData.totalCount || resData.TotalCount || 0);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tin tức:', error);
    } finally {
      setLoading(false);
    }
  };

  const featured = data[0];
  const rest = data.slice(1);

  return (
    <div className="news-page">

      {/* ── HERO BANNER ── */}
      <div className="news-hero">
        <div className="news-hero-inner">
          <div className="news-hero-label">
            <span className="pulse-dot" />
            Cập nhật mới nhất
          </div>
          <h1 className="news-hero-title">Tin tức & Thông báo</h1>
          <p className="news-hero-desc">
            Cổng thông tin chính thức về chính sách, quyết định và hoạt động
            của Chương trình Khuyến công Quốc gia
          </p>

          {/* Thanh tìm kiếm */}
          <div className="news-search-wrap">
            <span className="news-search-icon">🔍</span>
            <input
              className="news-search-input"
              type="text"
              placeholder="Tìm kiếm tin tức, thông báo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="news-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="news-body">

        {/* Bộ lọc danh mục */}
        <div className="news-filter-bar">
          {NEWS_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="news-empty">
            <p>Đang tải tin tức...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="news-empty">
            <div className="news-empty-icon">📭</div>
            <p>Không tìm thấy bài viết phù hợp.</p>
          </div>
        ) : (
          <>
            {/* ── BÀI NỔI BẬT (đầu tiên) ── */}
            {featured && (
              <div className="news-featured">
                <div className="news-featured-img">
                  {featured.imageUrl ? (
                    <img src={featured.imageUrl} alt={featured.title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                  ) : (
                    <div className="news-img-placeholder featured-placeholder">
                      <span>📰</span>
                    </div>
                  )}
                  {featured.isHot && <span className="hot-badge">🔥 Nổi bật</span>}
                </div>
                <div className="news-featured-body">
                  <div style={CATEGORY_COLOR[featured.category]} className="news-tag">
                    {featured.category}
                  </div>
                  <h2 className="news-featured-title">{featured.title}</h2>
                  <p className="news-featured-excerpt">{featured.excerpt}</p>
                  <div className="news-meta">
                    <span>📅 {new Date(featured.publishedAt).toLocaleDateString('vi-VN')}</span>
                    <span>👁 {featured.views.toLocaleString()} lượt xem</span>
                  </div>
                  <button className="btn-read-more primary">
                    Đọc toàn bài →
                  </button>
                </div>
              </div>
            )}

            {/* ── LƯỚI CÁC BÀI CÒN LẠI ── */}
            {rest.length > 0 && (
              <div className="news-grid">
                {rest.map(item => {
                  const tagStyle = CATEGORY_COLOR[item.category] || {};
                  return (
                    <article key={item.id} className="news-card">
                      <div className="news-card-img">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0'}} />
                        ) : (
                          <div className="news-img-placeholder">
                            <span>📄</span>
                          </div>
                        )}
                        {item.isHot && <span className="hot-badge small">🔥</span>}
                      </div>
                      <div className="news-card-body">
                        <span className="news-tag" style={tagStyle}>{item.category}</span>
                        <h3 className="news-card-title">{item.title}</h3>
                        <p className="news-card-excerpt">{item.excerpt}</p>
                        <div className="news-card-footer">
                          <div className="news-meta small">
                            <span>📅 {new Date(item.publishedAt).toLocaleDateString('vi-VN')}</span>
                            <span>👁 {item.views}</span>
                          </div>
                          <button className="btn-read-more">Đọc tiếp →</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Phân trang */}
        {totalCount > pageSize && (
          <div className="news-pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
            <span style={{margin: '0 15px', color: '#64748b'}}>Trang {page} / {Math.ceil(totalCount / pageSize)}</span>
            <button className="page-btn" disabled={page >= Math.ceil(totalCount / pageSize)} onClick={() => setPage(page + 1)}>Tiếp ›</button>
          </div>
        )}

      </div>
    </div>
  );
}
