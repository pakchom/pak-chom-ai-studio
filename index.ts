import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

const SERVER_NAME = "Pak Chom MCP Server";
const SERVER_VERSION = "0.1.0";

function createServer() {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.registerTool(
    "pak_chom_server_info",
    {
      description:
        "Menampilkan informasi dan status dasar Pak Chom MCP Server.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text",
          text: [
            `${SERVER_NAME}`,
            `Versi: ${SERVER_VERSION}`,
            "Status: aktif",
            "Akses: publik, tanpa login dan API Key",
            "Transport: MCP Streamable HTTP",
            "Endpoint: /mcp",
            "Fungsi: menyediakan tools generator Pak Chom.",
          ].join("\n"),
        },
      ],
    }),
  );

  server.registerTool(
    "pak_chom_generate_prompt",
    {
      description:
        "Menyusun draf prompt produksi dasar dari ide pengguna. Tool ini tidak memanggil layanan AI eksternal.",
      inputSchema: {
        ide: z.string().min(3).describe("Ide atau konsep konten yang ingin dibuat."),
        jenis_konten: z
          .string()
          .optional()
          .describe("Jenis konten, misalnya video edukasi, drama, atau horor."),
        gaya_visual: z
          .string()
          .optional()
          .describe("Gaya visual yang diinginkan."),
        rasio: z
          .enum(["9:16", "16:9", "1:1"])
          .default("9:16")
          .describe("Rasio aspek keluaran."),
      },
    },
    async ({ ide, jenis_konten, gaya_visual, rasio }) => {
      const prompt = [
        "BUAT PROMPT PRODUKSI KONTEN",
        `Ide utama: ${ide}`,
        `Jenis konten: ${jenis_konten ?? "Belum ditentukan"}`,
        `Gaya visual: ${gaya_visual ?? "Belum ditentukan"}`,
        `Rasio aspek: ${rasio}`,
        "",
        "Kembangkan ide tersebut menjadi konsep produksi yang jelas.",
        "Jaga konsistensi karakter, latar, suasana, dan detail visual.",
        "Hindari menambahkan fakta spesifik yang tidak diberikan pengguna.",
      ].join("\n");

      return {
        content: [{ type: "text", text: prompt }],
      };
    },
  );

  return server;
}

export default {
  fetch(request: Request, env: unknown, ctx: { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void }) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return Response.json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        status: "ok",
        mcp_endpoint: "/mcp",
        authentication: "none",
      });
    }

    if (url.pathname !== "/mcp") {
      return new Response("Not Found", { status: 404 });
    }

    return createMcpHandler(createServer)(request, env, ctx);
  },
};
