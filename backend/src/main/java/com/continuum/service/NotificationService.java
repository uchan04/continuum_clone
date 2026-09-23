package com.continuum.service;

import com.continuum.domain.model.OffboardingResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Notification Service
 * 
 * Sends email notifications to HR manager after offboarding events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${continuum.notifications.hr-manager-email}")
    private String hrManagerEmail;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send offboarding notification email
     */
    public void sendOffboardingNotification(OffboardingResult result) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(hrManagerEmail);
            helper.setSubject(formatSubject(result));
            helper.setText(formatEmailBody(result), true);

            mailSender.send(message);

            log.info("Offboarding notification sent to {} for event: {}", hrManagerEmail, result.getEventId());

        } catch (MessagingException e) {
            log.error("Failed to create email message for event: {}", result.getEventId(), e);
        } catch (MailException e) {
            log.error("Failed to send email for event: {}", result.getEventId(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending notification for event: {}", result.getEventId(), e);
        }
    }

    /**
     * Format email subject
     */
    private String formatSubject(OffboardingResult result) {
        String status = switch (result.getOverallStatus()) {
            case SUCCESS -> "✅ Success";
            case PARTIAL_FAILURE -> "⚠️ Partial Failure";
            case FAILURE -> "❌ Failure";
        };

        return String.format("Offboarding %s: %s", status, result.getEmployeeEmail());
    }

    /**
     * Format email body as HTML
     */
    private String formatEmailBody(OffboardingResult result) {
        StringBuilder html = new StringBuilder();
        
        html.append("<html><body style='font-family: Arial, sans-serif;'>");
        html.append("<h2>Offboarding Event Report</h2>");
        
        // Summary section
        html.append("<div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>");
        html.append("<h3>Summary</h3>");
        html.append("<table style='width: 100%;'>");
        html.append(formatRow("Event ID", result.getEventId()));
        html.append(formatRow("Employee Email", result.getEmployeeEmail()));
        html.append(formatRow("Overall Status", formatStatus(result.getOverallStatus().toString())));
        html.append(formatRow("Processing Time", result.getTotalProcessingTimeMs() + " ms"));
        html.append("</table>");
        html.append("</div>");
        
        // Steps section
        html.append("<h3>Service Revocation Steps</h3>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<thead>");
        html.append("<tr style='background-color: #4CAF50; color: white;'>");
        html.append("<th style='padding: 10px; text-align: left;'>Service</th>");
        html.append("<th style='padding: 10px; text-align: left;'>Status</th>");
        html.append("<th style='padding: 10px; text-align: left;'>Time (ms)</th>");
        html.append("<th style='padding: 10px; text-align: left;'>Error</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        for (OffboardingResult.StepResult step : result.getSteps()) {
            html.append("<tr style='border-bottom: 1px solid #ddd;'>");
            html.append("<td style='padding: 10px;'>").append(step.getServiceName()).append("</td>");
            html.append("<td style='padding: 10px;'>").append(formatStatus(step.getStatus().toString())).append("</td>");
            html.append("<td style='padding: 10px;'>").append(step.getProcessingTimeMs()).append("</td>");
            html.append("<td style='padding: 10px;'>").append(step.getErrorMessage() != null ? step.getErrorMessage() : "-").append("</td>");
            html.append("</tr>");
        }
        
        html.append("</tbody>");
        html.append("</table>");
        
        // Footer
        html.append("<div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;'>");
        html.append("<p><small>This is an automated notification from Continuum. Do not reply to this email.</small></p>");
        html.append("</div>");
        
        html.append("</body></html>");
        
        return html.toString();
    }

    /**
     * Format table row
     */
    private String formatRow(String label, String value) {
        return String.format("<tr><td style='padding: 5px; font-weight: bold;'>%s:</td><td style='padding: 5px;'>%s</td></tr>", label, value);
    }

    /**
     * Format status with color
     */
    private String formatStatus(String status) {
        return switch (status) {
            case "SUCCESS" -> "<span style='color: green; font-weight: bold;'>✅ " + status + "</span>";
            case "FAILURE" -> "<span style='color: red; font-weight: bold;'>❌ " + status + "</span>";
            case "PARTIAL_FAILURE" -> "<span style='color: orange; font-weight: bold;'>⚠️ " + status + "</span>";
            case "SKIPPED" -> "<span style='color: gray;'>⏭️ " + status + "</span>";
            default -> status;
        };
    }
}
