package com.continuum.domain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Session Manager
 * 
 * Manages employee sessions stored in Redis.
 * Clears all sessions when employee is offboarded.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionManager {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Clear all Redis sessions for an employee
     * 
     * Searches for keys matching pattern: session:employee:{email}:*
     * and deletes them all.
     * 
     * @param employeeEmail Employee email
     * @return Number of sessions cleared
     */
    public int clearEmployeeSessions(String employeeEmail) {
        try {
            String pattern = "session:employee:" + employeeEmail + ":*";
            Set<String> keys = redisTemplate.keys(pattern);

            if (keys == null || keys.isEmpty()) {
                log.info("No sessions found for employee: {}", employeeEmail);
                return 0;
            }

            Long deletedCount = redisTemplate.delete(keys);
            int cleared = deletedCount != null ? deletedCount.intValue() : 0;

            log.info("Cleared {} sessions for employee: {}", cleared, employeeEmail);
            return cleared;

        } catch (Exception e) {
            log.error("Error clearing sessions for employee: {}", employeeEmail, e);
            throw new RuntimeException("Failed to clear employee sessions: " + e.getMessage(), e);
        }
    }

    /**
     * Store employee session in Redis
     * 
     * Key format: session:employee:{email}:{sessionId}
     */
    public void storeEmployeeSession(String employeeEmail, String sessionId, Object sessionData) {
        String key = "session:employee:" + employeeEmail + ":" + sessionId;
        redisTemplate.opsForValue().set(key, sessionData);
        log.debug("Stored session {} for employee: {}", sessionId, employeeEmail);
    }

    /**
     * Remove specific session
     */
    public void removeEmployeeSession(String employeeEmail, String sessionId) {
        String key = "session:employee:" + employeeEmail + ":" + sessionId;
        redisTemplate.delete(key);
        log.debug("Removed session {} for employee: {}", sessionId, employeeEmail);
    }
}
