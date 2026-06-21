export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 30) return `${diffDays} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatActiveDuration(activatedAtStr: string | null | undefined): string {
  if (!activatedAtStr) return "";
  const activatedAt = new Date(activatedAtStr);
  if (isNaN(activatedAt.getTime())) return "";
  
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - activatedAt.getTime());

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  let years = Math.floor(totalDays / 365);
  let remainingDays = totalDays % 365;
  let months = Math.floor(remainingDays / 30);
  remainingDays = remainingDays % 30;

  if (years > 0) {
    if (months > 0) return `${years} yıl ${months} ay`;
    return `${years} yıl`;
  }
  if (months > 0) {
    if (remainingDays > 0) return `${months} ay ${remainingDays} gün`;
    return `${months} ay`;
  }
  if (totalDays > 0) {
    return `${totalDays} gün`;
  }
  if (remainingHours > 0) {
    return `${remainingHours} saat`;
  }
  return "az önce";
}
