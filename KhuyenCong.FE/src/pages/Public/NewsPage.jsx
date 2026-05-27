import React, { useState } from 'react';
import './NewsPage.css';

/* ── Dữ liệu mẫu ── */
const NEWS_CATEGORIES = ['Tất cả', 'Thông báo', 'Quyết định', 'Hướng dẫn', 'Sự kiện', 'Chính sách'];

const NEWS_DATA = [
  {
    id: 1, category: 'Thông báo', hot: true,
    date: '20/05/2026', views: 1240,
    title: 'Quyết định phê duyệt danh mục đề án khuyến công quốc gia năm 2026',
    excerpt: 'Cục Công Thương địa phương thông báo tới các Sở Công Thương về việc phê duyệt danh mục các đề án khuyến công điểm và đề án nhóm thuộc Chương trình khuyến công quốc gia.',
    color: '#1a2d56',
  },
  {
    id: 2, category: 'Chính sách', hot: true,
    date: '18/05/2026', views: 876,
    title: 'Chính sách hỗ trợ doanh nghiệp nhỏ và vừa trong lĩnh vực công nghiệp nông thôn',
    excerpt: 'Nhằm thúc đẩy phát triển kinh tế địa phương, Bộ Công Thương ban hành chính sách hỗ trợ đặc biệt dành cho các doanh nghiệp vừa và nhỏ tham gia chương trình khuyến công.',
    color: '#8b4513',
  },
  {
    id: 3, category: 'Sự kiện', hot: false,
    date: '15/05/2026', views: 512,
    title: 'Hội nghị tổng kết Chương trình Khuyến công Quốc gia giai đoạn 2021–2025',
    excerpt: 'Hội nghị sẽ diễn ra tại Hà Nội vào ngày 25/05/2026, tổng kết những thành tích nổi bật và định hướng phát triển cho giai đoạn 2026–2030 của Chương trình Khuyến công.',
    color: '#155724',
  },
  {
    id: 4, category: 'Quyết định', hot: false,
    date: '12/05/2026', views: 398,
    title: 'Ban hành Thông tư hướng dẫn quản lý, sử dụng kinh phí khuyến công quốc gia',
    excerpt: 'Thông tư số 05/2026/TT-BCT quy định chi tiết về quy trình lập dự toán, phân bổ, quản lý và quyết toán kinh phí thực hiện các hoạt động khuyến công quốc gia.',
    color: '#1a2d56',
  },
  {
    id: 5, category: 'Hướng dẫn', hot: false,
    date: '08/05/2026', views: 721,
    title: 'Hướng dẫn nộp hồ sơ đề án khuyến công trực tuyến trên Cổng thông tin điện tử',
    excerpt: 'Để tạo thuận lợi cho các tổ chức, cá nhân, Cục Công Thương địa phương hướng dẫn chi tiết quy trình nộp hồ sơ đề án khuyến công trực tuyến qua hệ thống.',
    color: '#4a1942',
  },
  {
    id: 6, category: 'Thông báo', hot: false,
    date: '05/05/2026', views: 289,
    title: 'Thông báo lịch tiếp nhận hồ sơ khuyến công quốc gia đợt 2 năm 2026',
    excerpt: 'Cục Công Thương địa phương thông báo thời gian tiếp nhận hồ sơ đề án khuyến công quốc gia đợt 2 năm 2026 bắt đầu từ ngày 01/06/2026 đến 30/06/2026.',
    color: '#1a2d56',
  },
];

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

  const filtered = NEWS_DATA.filter(n => {
    const matchCat = activeCategory === 'Tất cả' || n.category === activeCategory;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                        n.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

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
              {cat !== 'Tất cả' && (
                <span className="chip-count">
                  {NEWS_DATA.filter(n => n.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
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
                  <div className="news-img-placeholder featured-placeholder">
                    <span>📰</span>
                  </div>
                  {featured.hot && <span className="hot-badge">🔥 Nổi bật</span>}
                </div>
                <div className="news-featured-body">
                  <div style={CATEGORY_COLOR[featured.category]} className="news-tag">
                    {featured.category}
                  </div>
                  <h2 className="news-featured-title">{featured.title}</h2>
                  <p className="news-featured-excerpt">{featured.excerpt}</p>
                  <div className="news-meta">
                    <span>📅 {featured.date}</span>
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
                        <div className="news-img-placeholder">
                          <span>📄</span>
                        </div>
                        {item.hot && <span className="hot-badge small">🔥</span>}
                      </div>
                      <div className="news-card-body">
                        <span className="news-tag" style={tagStyle}>{item.category}</span>
                        <h3 className="news-card-title">{item.title}</h3>
                        <p className="news-card-excerpt">{item.excerpt}</p>
                        <div className="news-card-footer">
                          <div className="news-meta small">
                            <span>📅 {item.date}</span>
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
        <div className="news-pagination">
          <button className="page-btn" disabled>‹ Trước</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span className="page-ellipsis">…</span>
          <button className="page-btn">8</button>
          <button className="page-btn">Tiếp ›</button>
        </div>

      </div>
    </div>
  );
}
