import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// ============================================================
// SecureImage — Component hiển thị ảnh có bảo mật JWT Token
// - Tự động đính kèm Authorization Header khi lấy ảnh từ API
// - Dùng blob URL để render ảnh mà không lộ link thật
// - Hỗ trợ cả chế độ <img> và background-image CSS
// ============================================================
const SecureImage = ({ src, alt, className, style, asBackground = false, fallbackSrc = '' }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        const fetchImage = async () => {
            if (!src) {
                setImageSrc(fallbackSrc || null);
                setIsLoading(false);
                return;
            }

            // Nếu là ảnh lấy từ API nội bộ (path chứa /api/file/download/)
            if (src.includes('/api/file/download/') || src.includes('/file/download/')) {
                try {
                    setIsLoading(true);

                    // QUAN TRỌNG: api.js có baseURL = '/api'
                    // Nếu src = '/api/file/download/abc.jpg', phải strip phần /api ra đầu
                    // để tránh URL bị cộng đôi thành /api/api/file/download/abc.jpg (lỗi 404)
                    let relativePath = src;
                    if (relativePath.startsWith('/api/')) {
                        relativePath = relativePath.substring(4); // bỏ '/api' → '/file/download/abc.jpg'
                    } else if (relativePath.includes('/api/')) {
                        // Trường hợp src = 'http://localhost/api/file/download/...'
                        const idx = relativePath.indexOf('/api/');
                        relativePath = relativePath.substring(idx + 4); // → '/file/download/...'
                    }

                    // Gọi API kèm JWT Token (api interceptor tự thêm Authorization header)
                    const response = await api.get(relativePath, { responseType: 'blob' });

                    objectUrl = URL.createObjectURL(response.data);
                    if (isMounted) {
                        setImageSrc(objectUrl);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error('SecureImage: Không tải được ảnh:', error);
                    if (isMounted) {
                        setImageSrc(fallbackSrc || null);
                        setIsLoading(false);
                    }
                }
            } else {
                // Ảnh URL public bình thường (Unsplash, MinIO public bucket...)
                setImageSrc(src);
                setIsLoading(false);
            }
        };

        fetchImage();

        // Dọn dẹp bộ nhớ khi component bị unmount hoặc src thay đổi
        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Render trạng thái đang tải ---
    if (isLoading) {
        if (asBackground) {
            return (
                <div
                    className={className}
                    style={{ ...style, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Đang tải ảnh...</span>
                </div>
            );
        }
        return <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', ...style }} className={className} />;
    }

    // --- Chế độ Background Image (cho thẻ div ảnh nền) ---
    if (asBackground) {
        return (
            <div
                className={className}
                style={{
                    ...style,
                    backgroundImage: `url("${imageSrc || fallbackSrc}")`
                }}
            ></div>
        );
    }

    // --- Chế độ thẻ <img> thông thường ---
    return (
        <img
            src={imageSrc || fallbackSrc}
            alt={alt || 'Hình ảnh'}
            className={className}
            style={style}
            onError={(e) => { if (fallbackSrc && e.target.src !== fallbackSrc) e.target.src = fallbackSrc; }}
        />
    );
};

export default SecureImage;
