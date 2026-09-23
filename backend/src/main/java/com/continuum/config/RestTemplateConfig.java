package com.continuum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * REST Template Configuration
 * 
 * Configures HTTP client for external API calls (Slack, Google Workspace).
 * Sets connection and read timeouts to 5 seconds.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 seconds connection timeout
        factory.setReadTimeout(5000);     // 5 seconds read timeout
        
        return new RestTemplate(factory);
    }
}
