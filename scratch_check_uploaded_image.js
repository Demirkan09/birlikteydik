async function run() {
  const apiRegUrl = "https://birlikteydik.com/api/uploads/Gemini_Generated_Image_1sk2gw1sk2gw1sk2_1784154670331.png";
  const rawUrl = "https://birlikteydik.com/uploads/Gemini_Generated_Image_1sk2gw1sk2gw1sk2_1784154670331.png";
  
  try {
    console.log("-----------------------------------------");
    console.log("Checking API Upload URL:", apiRegUrl);
    const res1 = await fetch(apiRegUrl, { redirect: "manual" });
    console.log("API Status:", res1.status);
    console.log("Redirect Location:", res1.headers.get("location"));
    
    console.log("\nFollowing redirect...");
    const res1Follow = await fetch(apiRegUrl);
    console.log("Final URL after follow:", res1Follow.url);
    console.log("Final Status:", res1Follow.status);
    
    console.log("-----------------------------------------");
    console.log("Checking Raw Static URL:", rawUrl);
    const res2 = await fetch(rawUrl);
    console.log("Raw Static URL Status:", res2.status);
    
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
