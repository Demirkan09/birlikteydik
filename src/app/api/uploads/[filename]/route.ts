import { NextResponse } from "next/server";
import { promises as fs, statSync } from "fs";
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
      const stats = statSync(filePath);
      const fileSize = stats.size;

      // Determine content type based on extension
      const ext = path.extname(decodedFilename).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".mp3") contentType = "audio/mpeg";
      else if (ext === ".mp4") contentType = "video/mp4";
      else if (ext === ".m4a") contentType = "audio/mp4";
      else if (ext === ".wav") contentType = "audio/wav";
      else if (ext === ".ogg") contentType = "audio/ogg";

      const rangeHeader = request.headers.get("range");

      // Handle HTTP Range Requests (Essential for iOS Safari & HTML5 Audio/Video streaming)
      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (isNaN(start) || start >= fileSize || (parts[1] && isNaN(end)) || end >= fileSize || start > end) {
          return new Response("Requested Range Not Satisfiable", {
            status: 416,
            headers: {
              "Content-Range": `bytes */${fileSize}`,
            },
          });
        }

        const chunkSize = end - start + 1;
        const fileBuffer = await fs.readFile(filePath);
        const chunk = fileBuffer.subarray(start, end + 1);

        return new Response(chunk, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      // Standard Response with Content-Length & Accept-Ranges
      const fileBuffer = await fs.readFile(filePath);

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(fileSize),
          "Accept-Ranges": "bytes",
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
