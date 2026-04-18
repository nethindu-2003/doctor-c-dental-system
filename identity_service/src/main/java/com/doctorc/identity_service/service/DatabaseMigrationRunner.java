package com.doctorc.identity_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs once at startup to apply DB-level fixes that Hibernate ddl-auto:update
 * cannot handle automatically (e.g. dropping existing unique constraints).
 *
 * Safe to run repeatedly — every ALTER is guarded by an existence check.
 */
@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        dropPaymentAppointmentUniqueConstraintIfExists();
    }

    /**
     * Multiple treatment sessions can be linked to the same appointment,
     * which means multiple payment rows can share the same appointment_id.
     * Drop the UNIQUE constraint on payment.appointment_id if it still exists.
     */
    private void dropPaymentAppointmentUniqueConstraintIfExists() {
        try {
            // Check for various possible table and index name combinations
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS " +
                "WHERE TABLE_SCHEMA = DATABASE() " +
                "  AND (TABLE_NAME = 'Payment' OR TABLE_NAME = 'payment') " +
                "  AND (INDEX_NAME = 'UK_appointment_id' OR INDEX_NAME = 'appointment_id') " +
                "  AND NON_UNIQUE = 0",
                Integer.class
            );

            if (count != null && count > 0) {
                // Try dropping all variations
                String[] tables = {"Payment", "payment"};
                String[] indexes = {"UK_appointment_id", "appointment_id"};
                for (String t : tables) {
                    for (String i : indexes) {
                        try {
                            jdbcTemplate.execute("ALTER TABLE " + t + " DROP INDEX " + i);
                            System.out.println("[Migration] Dropped unique index " + i + " from " + t);
                        } catch (Exception e) { /* expected if doesn't exist */ }
                    }
                }
            }
        } catch (Exception e) {
            // Broad scan if specific names failed
            try {
                String indexName = jdbcTemplate.queryForObject(
                    "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "  AND (TABLE_NAME = 'Payment' OR TABLE_NAME = 'payment') " +
                    "  AND COLUMN_NAME = 'appointment_id' " +
                    "  AND NON_UNIQUE = 0 " +
                    "LIMIT 1",
                    String.class
                );
                if (indexName != null) {
                    jdbcTemplate.execute("ALTER TABLE " + (indexName.contains("P") ? "Payment" : "payment") + " DROP INDEX `" + indexName + "`");
                }
            } catch (Exception inner) {
                System.out.println("[Migration] No unique constraint found or already dropped.");
            }
        }
    }
}
