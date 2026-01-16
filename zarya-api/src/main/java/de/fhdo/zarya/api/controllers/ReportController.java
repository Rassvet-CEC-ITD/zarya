package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.interfaces.services.IGeneralReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;

@Slf4j
@Controller
@AllArgsConstructor
public class ReportController {

    private final IGeneralReportService pdfService;

    @GetMapping("/auth/report")
    public void generateReport(HttpServletResponse response) throws IOException {
        pdfService.generateReportDirectlyToServletOutputStream(response);
    }
}
