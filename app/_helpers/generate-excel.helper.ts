import * as XLSX from "sheetjs-style";

type RowData = (string | number | boolean | null | undefined)[][];

const calculateColumnWidths = (header: string[], data: RowData) => {
  return header.map((_, colIndex) => {
    const columnContentLengths = data.map((row) => {
      if (!row[colIndex]) return 0;
      const cellValue = row[colIndex].toString();
      // For wrapped text, calculate width based on longest line
      const lines = cellValue.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      return maxLineLength;
    }); 
    const headerLength = header[colIndex].length;
    const maxLength = Math.max(headerLength, ...columnContentLengths);
    
    // Set reasonable min/max widths
    const width = Math.min(Math.max(maxLength + 2, 15), 80);
    return { width };
  });
};

export const generateExcelFile = (
  header: string[],
  data: RowData,
  fileName = "data.xlsx"
) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  ws["!cols"] = calculateColumnWidths(header, data);

  // Style header row
  header.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: {
        color: { rgb: "FFFFFF" },
        bold: true,
      },
      fill: {
        fgColor: { rgb: "16A34A" },
      },
      wrapText: true,
      alignment: {
        vertical: "top",
        horizontal: "left"
      }
    };
  });

  // Style data rows with text wrapping
  data.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({
        r: rowIndex + 1,
        c: colIndex,
      });

      if (ws[cellRef]) {
        // Apply text wrapping and alignment to all cells
        ws[cellRef].s = {
          ...ws[cellRef].s,
          wrapText: true,
          alignment: {
            vertical: "top",
            horizontal: "left"
          }
        };

        // Special handling for the last column (attachments)
        if (colIndex === header.length - 1 && cellValue) {
          const attachments = String(cellValue)
            .split(",")
            .map((link) => link.trim())
            .map((link) => {
              if (link.includes("drive.google.com/file/d/")) {
                const fileId = link.split("/d/")[1].split("/")[0];
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
              }
              return link;
            });

          const joinedLinks = attachments.join(",\n");

          ws[cellRef] = {
            ...ws[cellRef],
            t: "s",
            v: joinedLinks,
            l: { Target: joinedLinks, Tooltip: "Click to open" },
          };
        }
      }
    });
  });

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, fileName);
};