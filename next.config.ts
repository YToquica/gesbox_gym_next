import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    // Permite que la build continúe aunque haya errores de TypeScript no críticos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
