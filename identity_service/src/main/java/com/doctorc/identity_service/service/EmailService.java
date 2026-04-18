package com.doctorc.identity_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // --- 1. PATIENT VERIFICATION EMAIL ---
    public void sendVerificationEmail(String toEmail, String token) {
        String link = "http://localhost:3000/verify-email?token=" + token;

        String htmlContent = getHtmlTemplate(
                "Verify Your Account",
                "Welcome to Doctor C Dental Clinic! Please confirm your email address to activate your patient account.",
                "Verify Email",
                link
        );

        sendHtmlEmail(toEmail, "Verify your Doctor C Account", htmlContent);
    }

    // --- 2. PASSWORD RESET EMAIL (Updated with Role) ---
    public void sendPasswordResetEmail(String toEmail, String token, String role) {
        String link = "http://localhost:3000/login?token=" + token;

        // Capitalize Role for display (e.g., "patient" -> "Patient")
        String displayRole = "User"; // Default fallback
        if (role != null && !role.trim().isEmpty()) {
            displayRole = role.substring(0, 1).toUpperCase() + role.substring(1).toLowerCase();
        }

        String htmlContent = getHtmlTemplate(
                "Reset Your Password",
                "We received a request to reset the password for your <b>" + displayRole + "</b> account.<br>" +
                        "If you didn't ask for this, you can safely ignore this email.",
                "Reset Password",
                link
        );

        sendHtmlEmail(toEmail, "Reset Your Password - Doctor C (" + displayRole + ")", htmlContent);
    }

    // --- 3. DENTIST INVITATION EMAIL ---
    public void sendDentistInviteEmail(String toEmail, String name, String token) {
        String link = "http://localhost:3000/dentist/setup-password?token=" + token;

        String htmlContent = getHtmlTemplate(
                "Welcome, Dr. " + name,
                "An administrator has created your professional account at Doctor C Dental Clinic.<br>" +
                        "Please click the button below to set your secure password and access the dashboard.",
                "Activate Account",
                link
        );

        sendHtmlEmail(toEmail, "Doctor C Dental - Account Invitation", htmlContent);
    }

    // --- 4. BOOKING CONFIRMATION EMAIL ---
    public void sendBookingConfirmation(String toEmail, String patientName, String date, String time, String reason) {
        String link = "http://localhost:3000/login"; // Link to patient dashboard
        String message = String.format(
                "Dear %s,<br><br>Your appointment has been successfully confirmed.<br><br>" +
                        "<b>Date:</b> %s<br>" +
                        "<b>Time:</b> %s<br>" +
                        "<b>Reason:</b> %s<br><br>" +
                        "If you need to cancel or reschedule, please log in to your dashboard.",
                patientName, date, time, reason
        );

        String htmlContent = getHtmlTemplate(
                "Booking Confirmed!", message, "View Dashboard", link
        );

        sendHtmlEmail(toEmail, "Appointment Confirmation - Doctor C", htmlContent);
    }

    // --- 5. 12-HOUR APPOINTMENT REMINDER ---
    public void sendAppointmentReminder(String toEmail, String patientName, String date, String time) {
        String link = "http://localhost:3000/login";
        String message = String.format(
                "Dear %s,<br><br>This is a friendly reminder for your dental appointment scheduled in approximately 12 hours.<br><br>" +
                        "<b>Date:</b> %s<br>" +
                        "<b>Time:</b> %s<br><br>" +
                        "Please arrive 5-10 minutes early.",
                patientName, date, time
        );

        String htmlContent = getHtmlTemplate(
                "Upcoming Appointment Reminder", message, "Manage Appointment", link
        );

        sendHtmlEmail(toEmail, "Reminder: Dental Appointment in 12 Hours", htmlContent);
    }

    // --- 6. 24-HOUR TREATMENT SESSION REMINDER ---
    public void sendTreatmentReminder(String toEmail, String patientName, String sessionName, String date, String time) {
        String link = "http://localhost:3000/login";
        String message = String.format(
                "Dear %s,<br><br>This is a reminder for your upcoming treatment session tomorrow.<br><br>" +
                        "<b>Procedure:</b> %s<br>" +
                        "<b>Date:</b> %s<br>" +
                        "<b>Time:</b> %s<br><br>" +
                        "We look forward to seeing you.",
                patientName, sessionName, date, time
        );

        String htmlContent = getHtmlTemplate(
                "Treatment Session Reminder", message, "View Details", link
        );

        sendHtmlEmail(toEmail, "Reminder: Upcoming Treatment Session", htmlContent);
    }

    // --- 7. PATIENT INVITATION EMAIL ---
    public void sendPatientInviteEmail(String toEmail, String name, String token) {
        // This link directs them to a page where they type in a new password
        String link = "http://localhost:3000/patient/setup-password?token=" + token;

        String htmlContent = getHtmlTemplate(
                "Welcome to Doctor C, " + name + "!",
                "An administrator has created your patient profile at Doctor C Dental Clinic.<br>" +
                        "Please click the button below to set up your secure password and access your patient dashboard.",
                "Set Password & Activate",
                link
        );

        sendHtmlEmail(toEmail, "Doctor C Dental - Patient Account Invitation", htmlContent);
    }

    // --- 9. NEXT SESSION SCHEDULED ---
    public void sendNextSessionScheduled(String toEmail, String patientName, String sessionName, String nextDate) {
        String link = "http://localhost:3000/login";
        String message = String.format(
                "Dear %s,<br><br>The dentist has scheduled your next treatment session.<br><br>" +
                        "<b>Treatment:</b> %s<br>" +
                        "<b>Next Scheduled Date:</b> %s<br><br>" +
                        "Please mark your calendar.",
                patientName, sessionName, nextDate
        );

        String htmlContent = getHtmlTemplate(
                "Next Session Scheduled", message, "View Details", link
        );

        sendHtmlEmail(toEmail, "Next Treatment Session - Doctor C Dental", htmlContent);
    }

    // --- 8. APPOINTMENT CANCELLATION EMAIL ---
    public void sendCancellationEmail(String toEmail, String patientName, String date, String time) {
        String link = "http://localhost:3000/login";
        String message = String.format(
                "Dear %s,<br><br>We regret to inform you that your appointment scheduled for <b>%s at %s</b> has been cancelled by the clinic administration.<br><br>" +
                        "If you would like to book a new appointment, please log in to your dashboard or contact the clinic directly.",
                patientName, date, time
        );

        String htmlContent = getHtmlTemplate(
                "Appointment Cancelled", message, "Book New Appointment", link
        );

        sendHtmlEmail(toEmail, "Notice: Appointment Cancelled - Doctor C Dental", htmlContent);
    }

    // --- 9. APPOINTMENT RESCHEDULE EMAIL ---
    public void sendRescheduleEmail(String toEmail, String patientName, String oldDate, String oldTime, String newDate, String newTime) {
        String link = "http://localhost:3000/login";
        String message = String.format(
                "Dear %s,<br><br>Your upcoming appointment has been rescheduled by the clinic.<br><br>" +
                        "<b>Old Appointment:</b> %s at %s<br>" +
                        "<b>New Appointment:</b> <span style='color: #0E4C5C; font-weight: bold;'>%s at %s</span><br><br>" +
                        "If this new time does not work for you, please log in to reschedule.",
                patientName, oldDate, oldTime, newDate, newTime
        );

        String htmlContent = getHtmlTemplate(
                "Appointment Rescheduled", message, "View Appointment", link
        );

        sendHtmlEmail(toEmail, "Notice: Appointment Rescheduled - Doctor C Dental", htmlContent);
    }

    // --- HELPER: SEND THE ACTUAL EMAIL ---
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // 'true' = multipart (needed for HTML)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // 'true' = isHtml

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (jakarta.mail.AuthenticationFailedException e) {
            System.err.println("Email authentication failed. Check SMTP credentials.");
            throw new RuntimeException("Email service authentication failed. Please contact support.", e);
        } catch (jakarta.mail.MessagingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    // --- HELPER: PROFESSIONAL HTML TEMPLATE ---
    private String getHtmlTemplate(String title, String message, String buttonText, String link) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #0E4C5C; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
                    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
                    .btn-container { text-align: center; margin-top: 30px; }
                    .btn { background-color: #0E4C5C; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(14, 76, 92, 0.3); }
                    .btn:hover { background-color: #083642; }
                    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
                    a { color: #0E4C5C; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Doctor C Dental</h1>
                    </div>
                    <div class="content">
                        <h2 style="color: #0E4C5C; margin-top: 0;">%s</h2>
                        <p>%s</p>
                        <div class="btn-container">
                            <a href="%s" class="btn">%s</a>
                        </div>
                        <p style="margin-top: 30px; font-size: 13px; color: #666;">
                            Or copy this link: <br> <a href="%s">%s</a>
                        </p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Doctor C Dental Clinic. All rights reserved.<br>
                        This is an automated message, please do not reply.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(title, message, link, buttonText, link, link);
    }
}