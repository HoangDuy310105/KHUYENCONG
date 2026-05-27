import React from 'react';

const GuidePage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
        Hướng dẫn sử dụng & Tài liệu
      </h2>
      
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-blue-700">1. Hướng dẫn đăng ký tài khoản cho Cơ sở CNNT</h4>
                  <p className="text-sm text-gray-500 mt-1">Các bước để tạo tài khoản và nộp hồ sơ xin cấp kinh phí khuyến công.</p>
                </div>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200">
                  Tải PDF
                </button>
              </div>
            </li>
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-blue-700">2. Quy trình 10 bước xử lý đề án Khuyến công Quốc gia</h4>
                  <p className="text-sm text-gray-500 mt-1">Sơ đồ luồng từ lúc lập bản nháp đến khi phê duyệt và quyết toán.</p>
                </div>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200">
                  Tải PDF
                </button>
              </div>
            </li>
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-blue-700">3. Thông tư 34/2022/TT-BCT và các văn bản liên quan</h4>
                  <p className="text-sm text-gray-500 mt-1">Cơ sở pháp lý, quy định mức hỗ trợ và quản lý kinh phí.</p>
                </div>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200">
                  Tải PDF
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
