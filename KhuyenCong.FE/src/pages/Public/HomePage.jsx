import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Landmark, Search, Building2,
  HelpCircle, FileText, Factory, Map, CircleDollarSign,
  Cog, Shirt, Sprout, Hammer, FlaskConical, Pizza, Zap, Monitor, LeafyGreen,
  Newspaper, Target
} from 'lucide-react';
import './HomePage.css';

/* ============================================================
   COMPONENT CHÍNH: TRANG CHỦ
   ============================================================ */
const HomePage = () => {
  /* ============================================================
     DỮ LIỆU MẪU
     ============================================================ */
  const FEATURES = [
    { icon: ClipboardList, label: 'Đề án điện tử',      desc: 'Nộp & theo dõi hồ sơ' },
    { icon: Landmark, label: 'Hợp đồng điện tử', desc: 'MỚI' },
    { icon: FileText, label: 'Bảo lãnh điện tử',       desc: 'MỚI' },
    { icon: Target, label: 'Báo giá trực tuyến rút gọn',       desc: 'MỚI' },
    { icon: Search, label: 'Mua sắm trực tuyến',    desc: 'MỚI' },
    { icon: CircleDollarSign, label: 'Thanh toán điện tử',      desc: 'Thanh toán trực tuyến' },
  ];

  const BANNERS_CTA = [
    { icon: HelpCircle, label: 'Dành cho người dùng mới →', bg: '#0b3b55', color: 'white' },
    { icon: Search, label: 'Giám sát hoạt động khuyến công →', bg: '#c8965a', color: 'white' },
    { icon: FileText, label: 'Tra cứu dữ liệu hệ thống cũ →',    bg: '#ba7a35', color: 'white' },
  ];

  const STATS = [
    { value: '1,250+', label: 'Đề án đã triển khai', icon: ClipboardList },
    { value: '680+',   label: 'Doanh nghiệp thụ hưởng', icon: Factory },
    { value: '34',     label: 'Tỉnh thành tham gia', icon: Map },
    { value: '3.2 tỷ', label: 'Kinh phí giải ngân', icon: CircleDollarSign },
  ];

  const LINH_VUCS = [
    { icon: Cog, name: 'Cơ khí & Điện', count: 180 },
    { icon: Shirt, name: 'Dệt may & Da giày', count: 140 },
    { icon: Sprout, name: 'Chế biến nông lâm sản', count: 320 },
    { icon: Hammer, name: 'Vật liệu xây dựng', count: 95 },
    { icon: FlaskConical, name: 'Hóa chất & Nhựa', count: 60 },
    { icon: Pizza, name: 'Thực phẩm & OCOP', count: 210 },
    { icon: Zap, name: 'Năng lượng sạch', count: 45 },
    { icon: Monitor, name: 'Điện tử & Số', count: 70 },
    { icon: LeafyGreen, name: 'Môi trường · SX sạch', count: 130 },
  ];

  const DE_ANS = [
    { id: 'KCQG-2024-001', name: 'Hỗ trợ ứng dụng máy móc thiết bị tiên tiến trong sản xuất lúa gạo', donVi: 'HTX Nông nghiệp Sạch Đồng Tháp', linhVuc: 'Chế biến nông lâm sản', kinhPhi: '850 triệu', status: 'Đang thực hiện', statusColor: 'blue' },
    { id: 'KCQG-2024-002', name: 'Đào tạo nghề May công nghiệp cho lao động nông thôn huyện Bình Đại', donVi: 'Cty TNHH May mặc Bến Tre', linhVuc: 'Dệt may & Da giày', kinhPhi: '460 triệu', status: 'Đã phê duyệt', statusColor: 'green' },
    { id: 'KCDP-2024-015', name: 'Xây dựng mô hình trình diễn sản xuất sạch hơn tại cơ sở VLXD', donVi: 'Cty CP VLXD Tiền Giang', linhVuc: 'Vật liệu xây dựng', kinhPhi: '320 triệu', status: 'Chờ thẩm định', statusColor: 'orange' },
    { id: 'KCDP-2024-022', name: 'Hỗ trợ liên doanh liên kết, xây dựng vùng nguyên liệu muối', donVi: 'HTX Sản xuất Muối Tiền Giang', linhVuc: 'Chế biến nông lâm sản', kinhPhi: '290 triệu', status: 'Đã phê duyệt', statusColor: 'green' },
  ];

  const [tinTucs, setTinTucs] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/tin-tuc?page=1&pageSize=4');
        const resData = await response.json();
        const items = resData.items || resData.Items || [];
        setTinTucs(items.slice(0, 4));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tin tức:', error);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="home-page">

      {/* ========== SECTION 1: TÌM KIẾM (Banner compact) ========== */}
      <section className="search-section">
        <div className="search-inner">
          <div className="search-tabs">
            <button className="search-tab active">
              <Building2 size={18} style={{marginRight: '6px'}} /> Lựa chọn đơn vị
            </button>
            <button className="search-tab">
              <ClipboardList size={18} style={{marginRight: '6px'}} /> Lựa chọn đề án
            </button>
          </div>
          <div className="search-main-row">
            <div className="search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Nhập từ khóa (ví dụ: Mã đề án, Tên đơn vị, Lĩnh vực...)" />
            </div>
            <button className="search-btn">Tìm kiếm</button>
            <button className="search-advanced-btn">Tìm kiếm nâng cao</button>
          </div>
          <div className="search-filters">
            <span>Tìm theo:</span>
            <label className="radio-label"><input type="radio" name="searchType" defaultChecked /> Mã đề án / Tên đơn vị</label>
            <label className="radio-label"><input type="radio" name="searchType" /> Lĩnh vực KC</label>
            <label className="radio-label"><input type="radio" name="searchType" /> Tỉnh / Thành phố</label>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: FEATURE SHORTCUTS (Phím tắt chức năng) ========== */}
      <section className="features-section">
        <div className="section-inner">
          <div className="features-grid">
            {FEATURES.map((f, i) => {
              const IconComp = f.icon;
              return (
                <a key={i} href="#" className="feature-card" style={{position: 'relative', overflow: 'hidden'}}>
                  <div className="feature-icon"><IconComp size={32} color="#0b3b55" strokeWidth={1.5} /></div>
                  <div className="feature-info">
                    <div className="feature-label">{f.label}</div>
                    {f.desc === 'MỚI' ? (
                      <span style={{background: '#ea4335', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', position: 'absolute', top: '10px', right: '10px'}}>MỚI</span>
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: CTA BANNERS 3 ô ========== */}
      <section className="cta-banners-section">
        <div className="section-inner">
          <div className="cta-banners-grid">
            {BANNERS_CTA.map((b, i) => {
              const IconComp = b.icon;
              return (
                <a key={i} href="#" className="cta-banner" style={{ background: b.bg }}>
                  <span style={{ fontSize: '22px' }}><IconComp size={24} /></span>
                  <span style={{ color: b.color, fontWeight: 700, fontSize: '15px' }}>{b.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: THỐNG KÊ ========== */}
      <section className="stats-section">
        <div className="section-inner">
          <div className="stats-grid">
            {STATS.map((s, i) => {
              const IconComp = s.icon;
              return (
                <div key={i} className="stat-item">
                  <div className="stat-icon"><IconComp size={40} color="#1a2d56" strokeWidth={1.5} /></div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SECTION 5: NỘI DUNG CHÍNH (3 cột) ========== */}
      <section className="main-content-section">
        <div className="section-inner">
          <div className="main-content-grid">

            {/* Cột trái: Tin tức */}
            <div className="content-col">
              <div className="content-block-header">
                <h3>Tin nổi bật</h3>
                <a href="#" className="view-all-link">Xem tất cả ›</a>
              </div>
              <div className="news-list">
                {tinTucs.length > 0 ? tinTucs.map((t, i) => (
                  <Link key={t.id || i} to="/tin-tuc" className="news-item" style={{ textDecoration: 'none' }}>
                    <div className="news-thumb" style={{ width: '130px', height: '85px', padding: 0, overflow: 'hidden', background: '#f1f5f9', borderRadius: '6px' }}>
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Newspaper size={24} color="#94a3b8" />
                      )}
                    </div>
                    <div className="news-info">
                      <span className="news-date">{new Date(t.publishedAt || new Date()).toLocaleDateString('vi-VN')}</span>
                      <span className="news-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </span>
                    </div>
                  </Link>
                )) : (
                  <p style={{fontSize: '13px', color: '#64748b'}}>Đang tải tin tức...</p>
                )}
              </div>
            </div>

            {/* Cột giữa: Đề án */}
            <div className="content-col">
              <div className="content-block-header">
                <h3>Thông báo của Hệ thống</h3>
                <a href="#" className="view-all-link">Xem tất cả ›</a>
              </div>
              <div className="dean-list">
                {DE_ANS.map(da => (
                  <div key={da.id} className="dean-item">
                    <div className="dean-item-head">
                      <span className="dean-item-id">{da.id}</span>
                      <span className={`dean-item-status status-${da.statusColor}`}>{da.status}</span>
                    </div>
                    <a href="#" className="dean-item-name">{da.name}</a>
                    <div className="dean-item-meta" style={{display: 'flex', gap: '15px'}}>
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Building2 size={16} color="#666" /> {da.donVi}</span>
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><CircleDollarSign size={16} color="#666" /> {da.kinhPhi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải: Lĩnh vực + Hướng dẫn */}
            <div className="content-col sidebar-col">
              <div className="content-block-header">
                <h3>Chương trình đào tạo</h3>
              </div>
              <Link to="/huong-dan" className="guide-banner-link">
                <img src="/images/banner-khuyen-cong.png" alt="Khuyến công Đào tạo" className="guide-banner-img" />
              </Link>
            </div>

          </div>

          {/* Banner Đăng ký */}
          <div className="registration-banner">
            <div className="reg-banner-content">
              <h3>Bạn chưa đăng ký trên Hệ thống?</h3>
              <Link to="/register" className="reg-btn">Đăng ký tại đây</Link>
            </div>
            <div className="reg-banner-image">
              <img src="/images/registration-illustration.png" alt="Registration Illustration" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
