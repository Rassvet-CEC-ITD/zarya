package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.repositories.CategoricalCellRepository;
import de.fhdo.zarya.api.interfaces.repositories.NumericalCellRepository;
import de.fhdo.zarya.api.interfaces.services.IGeneralReportService;
import de.fhdo.zarya.api.persistance.models.CategoricalCell;
import de.fhdo.zarya.api.persistance.models.NumericalCell;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openpdf.text.*;
import org.openpdf.text.Font;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenPdfBasedGeneralReportService implements IGeneralReportService {

    private final CategoricalCellRepository categoricalCellRepository;
    private final NumericalCellRepository numericalCellRepository;

    public void generateReportDirectlyToServletOutputStream(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"report.pdf\"");
        Document document = new Document();
        try (OutputStream os = response.getOutputStream()) {
            PdfWriter pdfWriter = PdfWriter.getInstance(document, os);
            pdfWriter.setCloseStream(true);
            document.open();
            
            // Title in English
            Font titleFont = new Font(Font.UNDEFINED, 20, Font.BOLD);
            Paragraph titleEn = new Paragraph("Zarya Data - General Report", titleFont);
            titleEn.setAlignment(Element.ALIGN_CENTER);
            document.add(titleEn);
            
            // Title in Russian
            Paragraph titleRu = new Paragraph("Заря Данные - Общий Отчет", titleFont);
            titleRu.setAlignment(Element.ALIGN_CENTER);
            document.add(titleRu);
            
            document.add(Chunk.NEWLINE);
            
            // Date and Time
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            Paragraph dateTime = new Paragraph("Generated on: " + LocalDateTime.now().format(formatter));
            dateTime.setAlignment(Element.ALIGN_CENTER);
            document.add(dateTime);
            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);
            
            // Categorical Matrix Section - English
            addCategoricalMatrixSection(document, false);
            document.newPage();
            
            // Categorical Matrix Section - Russian
            addCategoricalMatrixSection(document, true);
            document.newPage();
            
            // Numerical Matrix Section - English
            addNumericalMatrixSection(document, false);
            document.newPage();
            
            // Numerical Matrix Section - Russian
            addNumericalMatrixSection(document, true);
            
            document.close();
        } catch (DocumentException e) {
            throw new IOException("Error writing PDF", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
    }
    
    private void addCategoricalMatrixSection(Document document, boolean isRussian) throws DocumentException {
        Font sectionFont = new Font(Font.UNDEFINED, 14, Font.BOLD);
        String title = isRussian ? "Категориальная Матрица" : "Categorical Matrix";
        Paragraph sectionTitle = new Paragraph(title, sectionFont);
        document.add(sectionTitle);
        document.add(Chunk.NEWLINE);
        
        List<CategoricalCell> cells = new ArrayList<>();
        categoricalCellRepository.findAll().forEach(cells::add);
        
        if (cells.isEmpty()) {
            String noData = isRussian ? "Нет категориальных данных." : "No categorical data available.";
            document.add(new Paragraph(noData));
            return;
        }
        
        // Create table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 2f, 3f, 3f});
        
        // Headers
        addTableHeader(table, isRussian ? "Индекс X" : "X Index");
        addTableHeader(table, isRussian ? "Индекс Y" : "Y Index");
        addTableHeader(table, isRussian ? "Категории" : "Categories");
        addTableHeader(table, isRussian ? "Частотное Распределение" : "Frequency Distribution");
        
        // Data rows
        for (CategoricalCell cell : cells) {
            table.addCell(String.valueOf(cell.getXIndex()));
            table.addCell(String.valueOf(cell.getYIndex()));
            
            // Categories
            String categories = cell.getCategory() != null 
                ? String.join(", ", cell.getCategory()) 
                : "N/A";
            table.addCell(categories);
            
            // Histogram statistics
            String histogram = calculateCategoricalHistogram(cell);
            table.addCell(histogram);
        }
        
        document.add(table);
        
        // Overall statistics
        document.add(Chunk.NEWLINE);
        addCategoricalStatistics(document, cells, isRussian);
    }
    
    private void addNumericalMatrixSection(Document document, boolean isRussian) throws DocumentException {
        Font sectionFont = new Font(Font.UNDEFINED, 14, Font.BOLD);
        String title = isRussian ? "Числовая Матрица" : "Numerical Matrix";
        Paragraph sectionTitle = new Paragraph(title, sectionFont);
        document.add(sectionTitle);
        document.add(Chunk.NEWLINE);
        
        List<NumericalCell> cells = new ArrayList<>();
        numericalCellRepository.findAll().forEach(cells::add);
        
        if (cells.isEmpty()) {
            String noData = isRussian ? "Нет числовых данных." : "No numerical data available.";
            document.add(new Paragraph(noData));
            return;
        }
        
        // Create table
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 1.5f, 2f, 2f, 2f, 2f});
        
        // Headers
        addTableHeader(table, isRussian ? "Индекс X" : "X Index");
        addTableHeader(table, isRussian ? "Индекс Y" : "Y Index");
        addTableHeader(table, isRussian ? "Среднее" : "Average");
        addTableHeader(table, isRussian ? "Дисперсия" : "Variance");
        addTableHeader(table, isRussian ? "Станд. Откл." : "Std Dev");
        addTableHeader(table, isRussian ? "Количество" : "Count");
        
        // Data rows
        for (NumericalCell cell : cells) {
            table.addCell(String.valueOf(cell.getXIndex()));
            table.addCell(String.valueOf(cell.getYIndex()));
            
            if (cell.getValue() != null && !cell.getValue().isEmpty()) {
                double avg = calculateAverage(cell.getValue());
                double variance = calculateVariance(cell.getValue(), avg);
                double stdDev = Math.sqrt(variance);
                
                table.addCell(String.format("%.2f", avg));
                table.addCell(String.format("%.2f", variance));
                table.addCell(String.format("%.2f", stdDev));
                table.addCell(String.valueOf(cell.getValue().size()));
            } else {
                table.addCell("N/A");
                table.addCell("N/A");
                table.addCell("N/A");
                table.addCell("0");
            }
        }
        
        document.add(table);
        
        // Overall statistics
        document.add(Chunk.NEWLINE);
        addNumericalStatistics(document, cells, isRussian);
    }
    
    private void addTableHeader(PdfPTable table, String headerText) {
        Font headerFont = new Font(Font.UNDEFINED, 10, Font.BOLD);
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(Color.GRAY);
        header.setPhrase(new Phrase(headerText, headerFont));
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        header.setPadding(5);
        table.addCell(header);
    }
    
    private String calculateCategoricalHistogram(CategoricalCell cell) {
        if (cell.getCategory() == null || cell.getCategory().isEmpty()) {
            return "No data";
        }
        
        Map<String, Long> frequencyMap = cell.getCategory().stream()
            .collect(Collectors.groupingBy(c -> c, Collectors.counting()));
        
        return frequencyMap.entrySet().stream()
            .map(e -> e.getKey() + ": " + e.getValue())
            .collect(Collectors.joining(", "));
    }
    
    private void addCategoricalStatistics(Document document, List<CategoricalCell> cells, boolean isRussian) throws DocumentException {
        Font statsFont = new Font(Font.UNDEFINED, 10, Font.BOLD);
        String statsTitle = isRussian ? "Общая Категориальная Статистика:" : "Overall Categorical Statistics:";
        document.add(new Paragraph(statsTitle, statsFont));
        
        int totalCells = cells.size();
        int totalCategories = cells.stream()
            .filter(c -> c.getCategory() != null)
            .mapToInt(c -> c.getCategory().size())
            .sum();
        
        Set<String> uniqueCategories = cells.stream()
            .filter(c -> c.getCategory() != null)
            .flatMap(c -> c.getCategory().stream())
            .collect(Collectors.toSet());
        
        if (isRussian) {
            document.add(new Paragraph("Всего Ячеек: " + totalCells));
            document.add(new Paragraph("Всего Записей Категорий: " + totalCategories));
            document.add(new Paragraph("Уникальных Категорий: " + uniqueCategories.size()));
            document.add(new Paragraph("Категории: " + String.join(", ", uniqueCategories)));
        } else {
            document.add(new Paragraph("Total Cells: " + totalCells));
            document.add(new Paragraph("Total Category Entries: " + totalCategories));
            document.add(new Paragraph("Unique Categories: " + uniqueCategories.size()));
            document.add(new Paragraph("Categories: " + String.join(", ", uniqueCategories)));
        }
    }
    
    private void addNumericalStatistics(Document document, List<NumericalCell> cells, boolean isRussian) throws DocumentException {
        Font statsFont = new Font(Font.UNDEFINED, 10, Font.BOLD);
        String statsTitle = isRussian ? "Общая Числовая Статистика:" : "Overall Numerical Statistics:";
        document.add(new Paragraph(statsTitle, statsFont));
        
        int totalCells = cells.size();
        List<Double> allValues = cells.stream()
            .filter(c -> c.getValue() != null)
            .flatMap(c -> c.getValue().stream())
            .collect(Collectors.toList());
        
        if (!allValues.isEmpty()) {
            double overallAvg = calculateAverage(allValues);
            double overallVariance = calculateVariance(allValues, overallAvg);
            double overallStdDev = Math.sqrt(overallVariance);
            
            if (isRussian) {
                document.add(new Paragraph("Всего Ячеек: " + totalCells));
                document.add(new Paragraph("Всего Значений: " + allValues.size()));
                document.add(new Paragraph(String.format("Общее Среднее: %.2f", overallAvg)));
                document.add(new Paragraph(String.format("Общая Дисперсия: %.2f", overallVariance)));
                document.add(new Paragraph(String.format("Общее Стандартное Отклонение: %.2f", overallStdDev)));
                document.add(new Paragraph(String.format("Минимальное Значение: %.2f", Collections.min(allValues))));
                document.add(new Paragraph(String.format("Максимальное Значение: %.2f", Collections.max(allValues))));
            } else {
                document.add(new Paragraph("Total Cells: " + totalCells));
                document.add(new Paragraph("Total Values: " + allValues.size()));
                document.add(new Paragraph(String.format("Overall Average: %.2f", overallAvg)));
                document.add(new Paragraph(String.format("Overall Variance: %.2f", overallVariance)));
                document.add(new Paragraph(String.format("Overall Standard Deviation: %.2f", overallStdDev)));
                document.add(new Paragraph(String.format("Min Value: %.2f", Collections.min(allValues))));
                document.add(new Paragraph(String.format("Max Value: %.2f", Collections.max(allValues))));
            }
        } else {
            String noData = isRussian ? "Нет числовых данных." : "No numerical data available.";
            document.add(new Paragraph(noData));
        }
    }
    
    private double calculateAverage(List<Double> values) {
        return values.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
    }
    
    private double calculateVariance(List<Double> values, double mean) {
        if (values.size() <= 1) {
            return 0.0;
        }
        
        double sumSquaredDiff = values.stream()
            .mapToDouble(v -> Math.pow(v - mean, 2))
            .sum();
        
        return sumSquaredDiff / values.size();
    }
}
