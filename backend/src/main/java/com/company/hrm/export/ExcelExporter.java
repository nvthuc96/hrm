package com.company.hrm.export;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Minimal, reusable .xlsx writer. Given a sheet name, headers and rows of plain
 * values, it produces the workbook bytes with a bold header row and sensible
 * per-type cell formatting.
 */
public final class ExcelExporter {

    private ExcelExporter() {
    }

    public static byte[] toXlsx(String sheetName, List<String> headers, List<List<Object>> rows) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet(sheetName);

            CellStyle headerStyle = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            headerStyle.setFont(bold);

            Row header = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers.get(i));
                c.setCellStyle(headerStyle);
            }

            int r = 1;
            for (List<Object> row : rows) {
                Row xr = sheet.createRow(r++);
                for (int i = 0; i < row.size(); i++) {
                    setCell(xr.createCell(i), row.get(i));
                }
            }

            // Fixed widths avoid AWT font metrics (autoSizeColumn) in headless runs.
            for (int i = 0; i < headers.size(); i++) {
                sheet.setColumnWidth(i, 22 * 256);
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Không tạo được file Excel", e);
        }
    }

    private static void setCell(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
        } else if (value instanceof BigDecimal bd) {
            cell.setCellValue(bd.doubleValue());
        } else if (value instanceof Number n) {
            cell.setCellValue(n.doubleValue());
        } else if (value instanceof LocalDate d) {
            cell.setCellValue(d.toString());
        } else if (value instanceof Boolean b) {
            cell.setCellValue(b ? "Có" : "Không");
        } else {
            cell.setCellValue(value.toString());
        }
    }
}
