import XLSX from "xlsx";

export type Participant = { name: string; tickets: number };

export function parseExcel(fileBuffer: Buffer): Participant[] {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  // Validate columns
  if (!rows.length || !("name" in rows[0]) || !("tickets" in rows[0])) {
    throw new Error("Excel must contain 'name' and 'tickets' columns");
  }

  return rows.map(row => ({
    name: String(row.name),
    tickets: Number(row.tickets) || 0,
  }));
}

export function pickWinner(entries: Participant[]): Participant | null {
  if (!entries.length) return null;

  const totalTickets = entries.reduce((sum, p) => sum + p.tickets, 0);
  let rand = Math.floor(Math.random() * totalTickets);

  for (const entry of entries) {
    rand -= entry.tickets;
    if (rand < 0) return entry;
  }
  return null;
}
