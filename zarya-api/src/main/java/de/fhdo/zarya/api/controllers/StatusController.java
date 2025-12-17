package de.fhdo.zarya.api.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StatusController {
    @GetMapping("/status")
    public String status(Model model) {
        model.addAttribute("status", "Enabled");
        return "status";
    }
}
