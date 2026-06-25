import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Menu, X } from 'lucide-react';
import L from 'leaflet';
import api from '../../services/api';
import './BanDo.css';
import 'leaflet/dist/leaflet.css';

// Sửa lỗi icon default của Leaflet trong React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon cho các trạng thái khác nhau
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  blue: createIcon('blue'),
  green: createIcon('green'),
  red: createIcon('red'),
  orange: createIcon('orange'),
  violet: createIcon('violet'),
  grey: createIcon('grey'),
  black: createIcon('black')
};

const STATUS_MAP = {
  0: { label: 'Bản Nháp', icon: icons.grey, color: '#64748b' },
  1: { label: 'Chờ Sở Thẩm Định', icon: icons.orange, color: '#d97706' },
  2: { label: 'Chờ Cục Thẩm Định', icon: icons.orange, color: '#d97706' },
  3: { label: 'Yêu Cầu Bổ Sung', icon: icons.red, color: '#b91c1c' },
  4: { label: 'Bị Từ Chối', icon: icons.red, color: '#dc2626' },
  5: { label: 'Đã Phê Duyệt', icon: icons.blue, color: '#0369a1' },
  6: { label: 'Đang Thực Hiện', icon: icons.green, color: '#047857' },
  7: { label: 'Đã Nghiệm Thu', icon: icons.violet, color: '#6d28d9' },
  8: { label: 'Đã Quyết Toán', icon: icons.black, color: '#1e293b' },
};

const BanDoPage = () => {
  const [deAns, setDeAns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linhVucs, setLinhVucs] = useState([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [linhVucFilter, setLinhVucFilter] = useState('');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Lấy dữ liệu Đề án và Lĩnh vực
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy lĩnh vực
        const resLv = await api.get('/linhvuc');
        setLinhVucs(resLv.data);

        // Lấy Đề án
        const resDa = await api.get('/dean?page=1&pageSize=1000');
        // Chỉ lấy những đề án có tọa độ hợp lệ
        const validDeAns = resDa.data.items.filter(d => d.viDo && d.kinhDo);
        setDeAns(validDeAns);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bản đồ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lọc dữ liệu
  const filteredDeAns = deAns.filter(d => {
    const matchStatus = statusFilter === '' || d.trangThai === parseInt(statusFilter);
    const matchLinhVuc = linhVucFilter === '' || d.linhVucId === linhVucFilter;
    return matchStatus && matchLinhVuc;
  });

  const totalKinhPhi = filteredDeAns.reduce((sum, d) => sum + (d.kinhPhiDuKien || 0), 0);

  // Tọa độ trung tâm (Bến Tre)
  const center = [10.2384, 106.3768];

  return (
    <div className="bando-container">
      {/* Khung bản đồ */}
      <div className="bando-map-wrapper">
        <MapContainer center={center} zoom={10} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
          >
            {filteredDeAns.map(d => {
              const statusInfo = STATUS_MAP[d.trangThai] || STATUS_MAP[0];
              return (
                <Marker 
                  key={d.id} 
                  position={[d.viDo, d.kinhDo]}
                  icon={statusInfo.icon}
                >
                  <Popup className="bando-popup">
                    <div className="popup-header">
                      <span className="popup-status" style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.label}
                      </span>
                      <h3 className="popup-title">{d.tenDeAn}</h3>
                    </div>
                    <div className="popup-body">
                      <div className="popup-row">
                        <strong>ĐV thụ hưởng:</strong> <span>{d.tenDonViThuHuong || '—'}</span>
                      </div>
                      <div className="popup-row">
                        <strong>Lĩnh vực:</strong> <span>{d.tenLinhVuc || '—'}</span>
                      </div>
                      <div className="popup-row">
                        <strong>Kinh phí dự kiến:</strong> <span className="text-finance">{d.kinhPhiDuKien?.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="popup-row">
                        <strong>Đã giải ngân:</strong> <span className="text-success">{(d.kinhPhiTamUng + d.kinhPhiQuyetToan)?.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="popup-row">
                        <strong>Địa điểm:</strong> <span>{d.diaDiem || d.diaChi || '—'}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Bảng điều khiển nổi */}
      <div className={`bando-floating-panel ${isPanelCollapsed ? 'collapsed' : ''}`}>
        {isPanelCollapsed ? (
          <button className="panel-hamburger-btn" onClick={() => setIsPanelCollapsed(false)}>
            <Menu size={24} />
          </button>
        ) : (
          <>
            <div className="panel-header" onClick={() => setIsPanelCollapsed(true)}>
              <div className="panel-title-wrap">
                <h2 className="panel-title">Phân bổ Đề án</h2>
              </div>
              <button className="panel-toggle-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="panel-content">
            <div className="panel-stats">
              <div className="stat-box">
                <div className="stat-label">Tổng số Đề án</div>
                <div className="stat-value">{filteredDeAns.length}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Tổng kinh phí</div>
                <div className="stat-value highlight">
                  {totalKinhPhi >= 1000000000 
                    ? (totalKinhPhi / 1000000000).toFixed(2) + ' Tỷ'
                    : (totalKinhPhi / 1000000).toFixed(0) + ' Tr'}
                </div>
              </div>
            </div>

            <div className="panel-filters">
              <div className="filter-group">
                <label>Trạng thái</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(STATUS_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Lĩnh vực</label>
                <select value={linhVucFilter} onChange={(e) => setLinhVucFilter(e.target.value)}>
                  <option value="">Tất cả lĩnh vực</option>
                  {linhVucs.map(lv => (
                    <option key={lv.id} value={lv.id}>{lv.tenLinhVuc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Legend */}
            <div className="panel-legend">
              <div className="legend-title">Chú giải màu sắc</div>
              <div className="legend-grid">
                <div className="legend-item"><span className="legend-dot" style={{ background: '#047857' }}></span> Đang thực hiện</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#0369a1' }}></span> Đã phê duyệt</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#6d28d9' }}></span> Đã nghiệm thu</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#1e293b' }}></span> Đã quyết toán</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#d97706' }}></span> Chờ thẩm định</div>
              </div>
            </div>

            {loading && (
              <div className="panel-loading">
                <i className="fa-solid fa-circle-notch fa-spin"></i> Đang tải dữ liệu...
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BanDoPage;
