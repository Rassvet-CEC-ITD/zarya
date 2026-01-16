package de.fhdo.zarya.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZaryaApiApplication {

    static void main(String[] args) {
        SpringApplication.run(ZaryaApiApplication.class, args);
    }

}
