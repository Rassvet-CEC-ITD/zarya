package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.services.IPdfService;
import jakarta.servlet.http.HttpServletResponse;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;

@Service
public class OpenPdfService implements IPdfService {
    public void generateReportDirectlyToServletOutputStream(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"report.pdf\"");
        Document document = new Document();
        try (OutputStream os = response.getOutputStream()) {
            PdfWriter.getInstance(document, os);
            document.open();
            document.add(new Paragraph("Report #101"));
            document.add(new Paragraph("Generated on: " + LocalDate.now()));
        } catch (DocumentException e) {
            throw new IOException("Error writing PDF", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
    }
}
