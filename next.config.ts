import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["msnodesqlv8", "mssql"], // මේකෙන් තමයි අර Error එක මඟහරින්නේ
};

export default nextConfig;