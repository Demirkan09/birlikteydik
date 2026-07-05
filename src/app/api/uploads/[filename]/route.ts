import { NextResponse } from "next/server";
import { promises as fs, createReadStream } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    // Decode filename to handle spaces/special characters
    const decodedFilename = decodeURIComponent(filename);

    // Path to the uploads directory on disk
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, decodedFilename);

    // Security check: prevent path traversal attacks
    const relative = path.relative(uploadDir, filePath);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    if (!isSafe) {
      return new Response("Forbidden", { status: 403 });
    }

    // Check if the file exists on disk and get its stats
    let fileStats;
    try {
      fileStats = await fs.stat(filePath);
    } catch {
      return new Response("Not Found", { status: 404 });
    }

    const totalSize = fileStats.size;

    // Determine content type based on file extension
    const ext = path.extname(decodedFilename).toLowerCase();
    let contentType = "application/octet-stream";
    
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".mp3") contentType = "audio/mpeg";
    else if (ext === ".wav") contentType = "audio/wav";
    else if (ext === ".svg") contentType = "image/svg+xml";

    // Check for Range header
    const rangeHeader = request.headers.get("range");

    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const startStr = parts[0];
      const endStr = parts[1];

      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : totalSize - 1;

      // Validate range bounds
      if (start >= totalSize || end >= totalSize || start > end) {
        return new Response("Requested Range Not Satisfiable", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      
      // Node.js stream for the requested range of bytes
      const fileStream = createReadStream(filePath, { start, end });
      
      // Convert Node.js readable stream to standard Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as any)));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        }
      });

      return new Response(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // No range request - serve full file using stream
    const fileStream = createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as any)));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      }
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": totalSize.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Upload streaming GET error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
