import { useState, useEffect } from 'react';
import api from '../../services/api';
import './ListPage.css';

function LinhVucPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get('/linhvuc');
      setData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      alert('Không thể tải danh sách lĩnh vực');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <h1>Lĩnh vực Khuyến công</h1>
        <button className="btn-primary">Thêm Lĩnh vực</button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Lĩnh vực</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.tenLinhVuc}</td>
                  <td>{item.moTa || 'Chưa có mô tả'}</td>
                  <td>
                    <button className="btn-text">Sửa</button>
                    <button className="btn-text danger">Xóa</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default LinhVucPage;
