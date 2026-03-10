import { useCallback } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


export const TableExport = (gridRef, sortedData, selectedRows, visibleColumns) => {
    const onExportCsv = useCallback(() => {
        if (selectedRows.length === 0) {
            toast.warning("Please select rows to export.", {
                position: "top-right",
            });
            return;
        }

        // Format data with double quotes to handle commas inside values
        const csvData = sortedData
            .filter((_, index) => selectedRows.includes(index))
            .map((row) =>
                visibleColumns
                    .filter((col) => col.visible)
                    .map((col) => `"${row[col.field]?.toString().replace(/"/g, '""')}"`) // Escape double quotes
                    .join(',')
            );

        // Include headers with double quotes
        const csvContent = [
            'No,' +
            visibleColumns
                .filter((col) => col.visible)
                .map((col) => `"${col.header}"`)
                .join(','), // Add visible column headers
            ...csvData.map((row, i) => `${i + 1},${row}`), // Add row number and data
        ].join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'table_data.csv';
        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(url);
    }, [sortedData, selectedRows, visibleColumns]);

    const downloadPdfFromCsv = () => {
        if (selectedRows.length === 0) {
            toast.warning("Please select rows to export.", {
                position: "top-right",
            });
            return;
        }

        const csvData = sortedData
            .filter((_, index) => selectedRows.includes(index))
            .map((row) =>
                visibleColumns
                    .filter((col) => col.visible)
                    .map((col) => `"${row[col.field]?.toString().replace(/"/g, '""')}"`)
                    .join(',')
            );

        const csvContent = [
            visibleColumns
                .filter((col) => col.visible)
                .map((col) => `"${col.header}"`)
                .join(','),
            ...csvData,
        ].join('\n');

        const rows = csvContent.split("\n").map((row) =>
            row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((cell) =>
                cell.startsWith('"') && cell.endsWith('"') ? cell.slice(1, -1) : cell
            )
        );

        const headers = rows[0];
        const body = rows.slice(1).filter((row) => row.length > 1);

        const doc = new jsPDF("landscape", "mm", "a2");
        doc.text("Exported Table Data", 14, 10);

        autoTable(doc, {
            head: [headers],
            body: body,
            startY: 20,
            styles: { fontSize: 8, overflow: "linebreak" },
            tableWidth: "auto",
        });

        doc.save("table_data.pdf");
    };

    const downloadExcelFromCsv = () => {
        if (selectedRows.length === 0) {
            toast.warning("Please select rows to export.", {
                position: "top-right",
            });
            return;
        }

        const csvData = sortedData
            .filter((_, index) => selectedRows.includes(index))
            .map((row) =>
                visibleColumns
                    .filter((col) => col.visible)
                    .map((col) => `"${row[col.field]?.toString().replace(/"/g, '""')}"`)
                    .join(',')
            );

        const csvContent = [
            visibleColumns
                .filter((col) => col.visible)
                .map((col) => `"${col.header}"`)
                .join(','),
            ...csvData,
        ].join('\n');

        const rows = csvContent.split("\n").map((row) =>
            row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((cell) =>
                cell.startsWith('"') && cell.endsWith('"') ? cell.slice(1, -1) : cell
            )
        );

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Rows");
        XLSX.writeFile(workbook, "selected_rows.xlsx");
    };

    const printTable = () => {
        if (selectedRows.length === 0) {
            toast.warning("Please select rows to print.", {
                position: "top-right",
            });
            return;
        }

        // Use the same logic as onExportCsv to generate CSV content
        const csvData = sortedData
            .filter((_, index) => selectedRows.includes(index))
            .map((row) =>
                visibleColumns
                    .filter((col) => col.visible)
                    .map((col) => `"${row[col.field]?.toString().replace(/"/g, '""')}"`) // Escape double quotes
                    .join(',')
            );

        const csvContent = [
            visibleColumns
                .filter((col) => col.visible)
                .map((col) => `"${col.header}"`)
                .join(','), // Add visible column headers
            ...csvData,
        ].join('\n');

        // Convert CSV to rows for printing
        const rows = csvContent.split("\n").map((row) =>
            row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((cell) =>
                cell.startsWith('"') && cell.endsWith('"') ? cell.slice(1, -1) : cell
            )
        );

        const headers = rows[0];
        const dataRows = rows.slice(1);

        const printContent = `
            <html>
                <head>
                    <title>Print Table</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                        }
                        table {
                            width: auto;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        th, td {
                            padding: 5px;
                            border: 1px solid #ddd;
                            text-align: left;
                            white-space: nowrap;
                        }
                        th {
                            background-color: #f2f2f2;
                            font-weight: bold;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            th, td {
                                padding: 3px;
                                font-size: 5px;
                                border: 1px solid #ddd;
                                white-space: nowrap;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h2>Exported Table Data</h2>
                    <table>
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${dataRows.map(row => {
            return `<tr>
                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                </tr>`;
        }).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=650,width=900');
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.focus();
        printWindow.print();
    };



    return {
        onExportCsv,
        downloadPdfFromCsv,
        downloadExcelFromCsv,
        printTable
    };
};