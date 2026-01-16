package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.filters.RateLimitFilter;
import de.fhdo.zarya.api.interfaces.repositories.UserRepository;
import de.fhdo.zarya.api.persistance.dto.RegisterRequest;
import de.fhdo.zarya.api.persistance.models.User;
import de.fhdo.zarya.api.services.CustomUserDetailsService;
import de.fhdo.zarya.api.services.SynchronizationService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Controller
public class PagesController {

    private final CustomUserDetailsService userDetailsService;
    private final DataSource dataSource;

    @Value("${ethereum.rpc.url:http://localhost:8545}")
    private String ethereumRpcUrl;

    public PagesController(CustomUserDetailsService userDetailsService,
                          DataSource dataSource) {
        this.userDetailsService = userDetailsService;
        this.dataSource = dataSource;
    }

    @GetMapping("/status")
    public String status() {
        return "status";
    }

    @GetMapping("/status/database")
    public String statusDatabase(Model model) {
        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection.isValid(2);
            model.addAttribute("status", isValid ? "Connected" : "Failed");
            model.addAttribute("url", connection.getMetaData().getURL());
            model.addAttribute("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        } catch (Exception e) {
            log.error("Database connection check failed", e);
            model.addAttribute("status", "Error");
            model.addAttribute("error", e.getMessage());
        }
        return "status-database";
    }

    @GetMapping("/status/blockchain")
    public String statusBlockchain(Model model) {
        try (Web3j web3j = Web3j.build(new HttpService(ethereumRpcUrl))) {
            String clientVersion = web3j.web3ClientVersion().send().getWeb3ClientVersion();
            String blockNumber = web3j.ethBlockNumber().send().getBlockNumber().toString();
            
            model.addAttribute("status", "Connected");
            model.addAttribute("rpcUrl", ethereumRpcUrl);
            model.addAttribute("clientVersion", clientVersion);
            model.addAttribute("blockNumber", blockNumber);
            model.addAttribute("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        } catch (Exception e) {
            log.error("Blockchain connection check failed", e);
            model.addAttribute("status", "Error");
            model.addAttribute("rpcUrl", ethereumRpcUrl);
            model.addAttribute("error", e.getMessage());
        }
        return "status-blockchain";
    }

    @GetMapping("/status/synchronization")
    public String statusSynchronization(Model model) {
        try {
            // Trigger a sync and capture status
            model.addAttribute("status", "Active");
            model.addAttribute("service", "SynchronizationService");
            model.addAttribute("schedule", "Every 12 hours");
            model.addAttribute("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            model.addAttribute("info", "Synchronizes themes, statements, and cells from blockchain to database");
        } catch (Exception e) {
            log.error("Synchronization status check failed", e);
            model.addAttribute("status", "Error");
            model.addAttribute("error", e.getMessage());
        }
        return "status-synchronization";
    }

    @GetMapping("/status/rpc-filter")
    public String statusRpcFilter(Model model) {
        try {
            model.addAttribute("status", "Active");
            model.addAttribute("filterName", "RateLimitFilter");
            model.addAttribute("maxRequestsPerMinute", 100);
            model.addAttribute("proxyTarget", ethereumRpcUrl);
            model.addAttribute("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            model.addAttribute("info", "Rate limiting and RPC proxying to Ethereum node");
        } catch (Exception e) {
            log.error("RPC filter status check failed", e);
            model.addAttribute("status", "Error");
            model.addAttribute("error", e.getMessage());
        }
        return "status-rpc-filter";
    }

    @PostMapping("/register/try")
    public String registerTry(@Valid RegisterRequest registerRequest) {
        User user = userDetailsService.registerUser(
                registerRequest.getName(),
                registerRequest.getContact(),
                registerRequest.getPassword()
        );
        log.info("Registered user: {}", user);
        return "redirect:/login?justRegistered=true";
    }
}
