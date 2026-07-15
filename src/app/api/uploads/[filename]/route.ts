import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    // Redirect to the static route served natively by Next.js.
    // This allows Cloudflare to handle edge range slicing correctly and prevents cache pollution.
    return NextResponse.redirect(new URL(`/uploads/${decodedFilename}`, request.url));
  } catch (err) {
    console.error("Upload streaming GET error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

