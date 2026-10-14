type CsvValue = string | number | boolean | null | undefined;

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvValue[][]
): void {
  const escapeCell = (value: CsvValue): string => {
    const text = String(value ?? '');
    const safeText =
      typeof value === 'string' && /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };

  const content = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(';'))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
