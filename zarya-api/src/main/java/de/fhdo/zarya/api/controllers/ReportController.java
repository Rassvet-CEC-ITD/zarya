package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.interfaces.services.IPdfService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;

@Controller
public class ReportController {

    private final IPdfService pdfService;

    public ReportController(@Autowired IPdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping("/report")
    public void generateReport(HttpServletResponse response) throws IOException {
        pdfService.generateReportDirectlyToServletOutputStream(response);
    }
}
