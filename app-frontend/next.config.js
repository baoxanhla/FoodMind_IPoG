// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ← DÒNG DUY NHẤT CẦN THÊM – BẬT CHO PHÉP FETCH RA NGOÀI TRONG APP ROUTER
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },

  // Hoặc cách 2 (cũng được): bật experimental
  experimental: {
    // Bắt buộc để fetch ra ngoài trong client component
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;