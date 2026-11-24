
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

// ==========================================
// PAK CHOM MCP SERVER
// ==========================================

const SERVER_NAME = "Pak Chom MCP Server";
const SERVER_VERSION = "0.2.0";

// ==========================================
// MASTER MCP SERVER
// ==========================================

function createServer() {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // ========================================
  // TOOL 1: SERVER INFORMATION
  // ========================================

  server.registerTool(
    "pak_chom_server_info",
    {
      description:
        "Menampilkan informasi dan status Pak Chom MCP Server.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text",
          text: [
            `Nama: ${SERVER_NAME}`,
            `Versi: ${SERVER_VERSION}`,
            "Status: Aktif",
            "Akses: Publik tanpa login dan API Key",
            "Transport: MCP Streamable HTTP",
            "Endpoint: /mcp",
            "Generator: Modular Pak Chom Generator Engine",
          ].join("\n"),
        },
      ],
    }),
  );

  // ========================================
  // TOOL 2: BASIC PROMPT GENERATOR
  // ========================================

  server.registerTool(
    "pak_chom_generate_prompt",
    {
      description:
        "Menyusun draf prompt produksi berdasarkan ide pengguna tanpa menggunakan API AI eksternal.",
      inputSchema: z.object({
        ide: z
          .string()
          .min(3)
          .describe("Ide utama atau konsep konten."),

        jenis_konten: z
          .string()
          .optional()
          .describe(
            "Jenis konten: edukasi, drama, horor, sains, atau lainnya."
          ),

        gaya_visual: z
          .string()
          .optional()
          .describe("Gaya visual yang diinginkan."),

        rasio: z
          .enum(["9:16", "16:9", "1:1"])
          .default("9:16")
          .describe("Ukuran atau rasio aspek konten."),
      }),
    },
    async ({ ide, jenis_konten, gaya_visual, rasio }) => {
      const prompt = [
        "PAK CHOM AI PROMPT GENERATOR",
        "================================",
        "",
        "KONSEP KONTEN",
        `Ide utama: ${ide}`,
        `Jenis konten: ${jenis_konten ?? "Belum ditentukan"}`,
        `Gaya visual: ${gaya_visual ?? "Belum ditentukan"}`,
        `Rasio aspek: ${rasio}`,
        "",
        "ARAHAN PRODUKSI",
        "1. Kembangkan ide menjadi konsep produksi yang jelas.",
        "2. Susun deskripsi visual yang konsisten.",
        "3. Perhatikan karakter, latar, suasana, dan pencahayaan.",
        "4. Sesuaikan komposisi dengan rasio aspek yang dipilih.",
        "5. Jangan menambahkan fakta yang tidak diberikan pengguna.",
        "",
        "CATATAN",
        "Hasil ini merupakan draf berbasis template dan logika server.",
        "Tidak menggunakan Gemini API atau OpenAI API.",
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      };
    },
  );

  return server;
}

// ==========================================
// MCP HANDLER
// ==========================================

const mcpHandler = createMcpHandler(createServer);

// ==========================================
// CLOUDFLARE WORKER
// ==========================================

export default {
  async fetch(
    request: Request,
    env: any,
    ctx: any
  ): Promise<Response> {
    const url = new URL(request.url);

    // SERVER HEALTH CHECK

    if (url.pathname === "/" && request.method === "GET") {
      return Response.json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        status: "online",
        mcp_endpoint: "/mcp",
        authentication: "none",
        generator_count: 1,
        available_tools: [
          "pak_chom_server_info",
          "pak_chom_generate_prompt",
        ],
      });
    }

    // MCP ENDPOINT

    if (url.pathname === "/mcp") {
      return mcpHandler(request, env, ctx);
    }

    // UNKNOWN ROUTE

    return new Response("Not Found", {
      status: 404,
    });
  },
};
