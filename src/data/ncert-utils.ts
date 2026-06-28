export function ncertChapterPdf(bookCode: string, chapterNum: number): string {
  return `https://ncert.nic.in/textbook/pdf/${bookCode}${String(chapterNum).padStart(2, "0")}.pdf`;
}

export function ncertFullBookZip(bookCode: string): string {
  return `https://ncert.nic.in/textbook/pdf/${bookCode}dd.zip`;
}

export function ncertPortalUrl(): string {
  return "https://ncert.nic.in/textbook.php";
}

export function buildChapters(bookCode: string, titles: string[]) {
  return titles.map((title, index) => ({
    id: `ch-${index + 1}`,
    number: index + 1,
    title,
    pdfUrl: ncertChapterPdf(bookCode, index + 1),
  }));
}

export function makeTextbook(
  id: string,
  title: string,
  bookCode: string,
  language: "English" | "Hindi" | "Urdu",
  chapterTitles: string[],
) {
  return {
    id,
    title,
    bookCode,
    language,
    chapters: buildChapters(bookCode, chapterTitles),
    fullBookZip: ncertFullBookZip(bookCode),
    ncertPortalUrl: ncertPortalUrl(),
  };
}
