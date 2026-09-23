package com.continuum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Continuum Application - B2B AI Offboarding Middleware MVP
 * 
 * Main entry point for the Spring Boot application.
 * Provides automated offboarding with 1-second OAuth revocation across
 * Slack and Google Workspace.
 */
@SpringBootApplication
@EnableAsync
public class ContinuumApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContinuumApplication.class, args);
    }
}
