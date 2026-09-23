package com.continuum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async Configuration
 * 
 * Configures thread pool for asynchronous offboarding operations.
 * Used by CompletableFuture for parallel execution of revocation tasks.
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "offboardingExecutor")
    public Executor offboardingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("offboarding-");
        executor.initialize();
        return executor;
    }
}
