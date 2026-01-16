package de.fhdo.zarya.api.interfaces.services;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface IGeneralReportService {
    void generateReportDirectlyToServletOutputStream(HttpServletResponse response) throws IOException;
}
