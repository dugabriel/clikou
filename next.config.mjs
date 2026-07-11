/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Decodificador HEIC (WASM embutido no JS): fica fora do bundle do
  // servidor e é carregado do node_modules em runtime, como o sharp.
  serverExternalPackages: ["heic-decode", "libheif-js"],
};

export default nextConfig;
