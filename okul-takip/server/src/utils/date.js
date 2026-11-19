/** 'YYYY-MM-DD' metnini yerel saatle öğlen 12:00 olarak yorumlar (saat dilimi kaymalarını önler) */
export function parseDay(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
  }
  return new Date(value);
}

/** Verilen tarihin ait olduğu haftanın Pazartesi gününü (00:00, yerel) döndürür */
export function weekStart(date) {
  const d = parseDay(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Pazartesi = 0
  d.setDate(d.getDate() - day);
  return d;
}
