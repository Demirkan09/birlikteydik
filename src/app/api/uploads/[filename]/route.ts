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

    // Determine the host and protocol from forwarded headers to support reverse-proxy setups
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "birlikteydik.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("3000");

    if (isLocal) {
      // Check if the file exists locally
      const filePath = path.join(process.cwd(), "public", "uploads", decodedFilename);
      let localExists = false;
      try {
        await fs.access(filePath);
        localExists = true;
      } catch {
        localExists = false;
      }

      if (localExists) {
        return NextResponse.redirect(new URL(`http://${host}/uploads/${decodedFilename}`));
      } else {
        // Fallback to production VDS URL so that images load during local development/testing.
        return NextResponse.redirect(new URL(`https://birlikteydik.com/uploads/${decodedFilename}`));
      }
    } else {
      // On production, redirect to the correct public path using forwarded headers
      return NextResponse.redirect(new URL(`${proto}://${host}/uploads/${decodedFilename}`));
    }
  } catch (err) {
    console.error("Upload streaming GET error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

