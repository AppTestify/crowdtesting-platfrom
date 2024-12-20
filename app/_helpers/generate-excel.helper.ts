import * as XLSX from "sheetjs-style";

type RowData = (string | number | boolean | null | undefined)[][];

const calculateColumnWidths = (header: string[], data: RowData) => {
    return header.map((_, colIndex) => {
        const columnContentLengths = data.map((row) => (row[colIndex] ? row[colIndex].toString().length : 0));
        const headerLength = header[colIndex].length;
        const maxLength = Math.max(headerLength, ...columnContentLengths);
        return { width: maxLength + 2 };
    });
};

export const generateExcelFile = (header: string[], data: RowData, fileName = "data.xlsx") => {
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
        };
    });

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName);
};