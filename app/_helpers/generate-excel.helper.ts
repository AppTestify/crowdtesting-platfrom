import * as XLSX from "sheetjs-style";

type RowData = (string | number | boolean | null | undefined)[][];

const calculateColumnWidths = (header: string[], data: RowData) => {
  return header.map((_, colIndex) => {
    const columnContentLengths = data.map((row) =>
      row[colIndex] ? row[colIndex].toString().length : 0
    ); 
    const headerLength = header[colIndex].length;
    const maxLength = Math.max(headerLength, ...columnContentLengths);
    return { width: maxLength + 2 };
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
    };
  });

  const lastColIndex = header.length - 1;
  data.forEach((row, rowIndex) => {
    const cellRef = XLSX.utils.encode_cell({
      r: rowIndex + 1,
      c: lastColIndex,
    });

    if (row[lastColIndex]) {
      const attachments = String(row[lastColIndex])
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
        t: "s",
        v: joinedLinks,
        l: { Target: joinedLinks, Tooltip: "Click to open" },
      };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, fileName);
};