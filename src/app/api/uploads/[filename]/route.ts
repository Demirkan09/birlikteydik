import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    const filePath = path.join(process.cwd(), "public", "uploads", decodedFilename);
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on extension
      const ext = path.extname(decodedFilename).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".mp3") contentType = "audio/mpeg";
      else if (ext === ".mp4") contentType = "video/mp4";
      
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // If file does not exist locally (e.g. during local dev), fallback to production URL
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("3000");
      
      if (isLocal) {
        return NextResponse.redirect(new URL(`https://birlikteydik.com/api/uploads/${decodedFilename}`));
      }
      
      return new Response("File Not Found", { status: 404 });
    }
  } catch (err) {
    console.error("Upload streaming GET error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

