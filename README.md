# Pak Chom MCP Server

MCP server pusat untuk ekosistem generator Pak Chom.

## Fitur tahap awal

- `pak_chom_server_info`: informasi server.
- `pak_chom_generate_prompt`: menyusun draf prompt dasar tanpa API AI eksternal.
- Endpoint MCP: `/mcp`
- Endpoint status sederhana: `/`

## Teknologi

- Cloudflare Workers
- Cloudflare Agents SDK (`createMcpHandler`)
- MCP Streamable HTTP
- TypeScript

## Pengembangan lokal

```bash
npm install
npm run dev
```

## Deployment

Cloudflare Workers Builds menggunakan deploy command default `npx wrangler deploy`.
Build command dapat dibiarkan kosong untuk proyek Worker sederhana ini.

## Catatan keamanan dan biaya

Server ini sengaja dibuat publik tanpa autentikasi. Jangan menambahkan data pribadi, rahasia, atau kredensial ke tools publik. Tambahkan rate limiting sebelum dibuka untuk penggunaan luas.

Generator tahap awal ini menyusun teks berdasarkan template dan logika lokal; ia tidak memanggil Gemini API atau OpenAI API.
