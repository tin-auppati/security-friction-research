import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,             // เช็คไฟล์ทุกๆ 1 วินาที
      aggregateTimeout: 300,  // รอ 0.3 วิให้ save เสร็จจริงค่อยรัน
    }
    return config
  },
};

export default nextConfig;
