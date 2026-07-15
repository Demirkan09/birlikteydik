const fs = require("fs");

async function run() {
  try {
    // Wait for the dev server to start
    console.log("Waiting 3 seconds for server to be ready...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("Sending POST request to upload API...");
    
    // Create a dummy file buffer
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    
    // Construct raw form data
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="adminEmail"\r\n\r\ninfo@birlikteydik.com\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test_image.png"\r\nContent-Type: image/png\r\n\r\nfake-image-bytes\r\n`,
      `--${boundary}--\r\n`
    ];
    
    const body = Buffer.concat(parts.map(p => Buffer.from(p)));
    
    const res = await fetch("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    
    console.log("Response Status:", res.status);
    const contentType = res.headers.get("content-type");
    console.log("Content Type:", contentType);
    
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      console.log("JSON Response:", data);
    } else {
      const text = await res.text();
      console.log("Text Response:", text.substring(0, 500));
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
