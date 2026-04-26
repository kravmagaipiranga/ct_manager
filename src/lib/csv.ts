export function exportToCSV<T>(
  data: T[], 
  columns: { header: string; key: keyof T | ((item: T) => string | number) }[], 
  filename: string
) {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const csvRows = [];

  // Header
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`);
  csvRows.push(headers.join(","));

  // Rows
  for (const row of data) {
    const values = columns.map(col => {
      let val = typeof col.key === "function" ? col.key(row) : row[col.key as keyof T];
      
      // Handle null or undefined
      if (val === null || val === undefined) {
        val = "";
      }
      
      // Convert to string and escape quotes
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" }); // UTF-8 BOM
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
