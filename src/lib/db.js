import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clikou";

// Cache da conexão para não abrir uma nova a cada hot-reload / requisição
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // MONGODB_DB permite apontar para outro banco no mesmo cluster (ex.: um
    // banco de testes) sem reescrever a URI. Vazio = usa o banco da própria URI.
    const opts = process.env.MONGODB_DB
      ? { dbName: process.env.MONGODB_DB }
      : undefined;
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
