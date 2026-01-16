package de.fhdo.zarya.api.configurations;

import de.fhdo.zarya.api.interfaces.repositories.UserRepository;
import de.fhdo.zarya.api.persistance.models.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${zarya.admin.name}")
    private String adminName;

    @Value("${zarya.admin.password}")
    private String adminPassword;

    @Value("${zarya.admin.contact}")
    private String adminContact;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByName(adminName)) {
            log.info("Initializing admin user: {}", adminName);

            User admin = new User();
            admin.setName(adminName);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setContact(adminContact);
            admin.setRoles(Set.of(User.RoleName.ROLE_ADMIN, User.RoleName.ROLE_DATA_SCIENTIST));
            admin.setEnabled(true);

            userRepository.save(admin);
            log.info("Admin user created successfully.");
        } else {
            log.info("Admin user {} already exists. Skipping initialization.", adminName);
        }
    }
}