import { NextResponse } from "next/server";
import { promises as fs } from "fs";
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

    // Check if the file exists on disk
    try {
      await fs.access(filePath);
    } catch {
      return new Response("Not Found", { status: 404 });
    }

    // Read file buffer from disk
    const fileBuffer = await fs.readFile(filePath);

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

    // Return the file stream/buffer directly to client
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Upload streaming GET error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
