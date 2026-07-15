async function run() {
  const url = "https://birlikteydik.com/uploads/ce431aad_f393_4109_a573_ed3d0a78e142_1783621206050.jpg";
  try {
    console.log("Checking production image:", url);
    const res = await fetch(url, { method: "HEAD" });
    console.log("HTTP Status:", res.status);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
