-- =============================================================================
-- Enterprise Review Platform - Database Schema
-- Charset: utf8mb4 | Engine: InnoDB
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id`                    CHAR(36)        NOT NULL,
    `phone_hash`            VARCHAR(64)     NOT NULL,
    `nickname`              VARCHAR(50)     DEFAULT NULL,
    `real_name`             TEXT            DEFAULT NULL COMMENT 'AES-256 encrypted',
    `id_card_number`        TEXT            DEFAULT NULL COMMENT 'AES-256 encrypted',
    `id_card_hash`          VARCHAR(64)     DEFAULT NULL,
    `register_ip`           VARCHAR(45)     DEFAULT NULL,
    `real_name_verified`    BOOLEAN         NOT NULL DEFAULT FALSE,
    `status`                ENUM('ACTIVE','BANNED','DELETED') NOT NULL DEFAULT 'ACTIVE',
    `deletion_requested_at` TIMESTAMP       NULL DEFAULT NULL,
    `deletion_completed_at` TIMESTAMP       NULL DEFAULT NULL,
    `created_at`            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone_hash` (`phone_hash`),
    KEY `idx_users_status` (`status`),
    KEY `idx_users_id_card_hash` (`id_card_hash`),
    KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------------------------
-- 2. companies
-- -----------------------------------------------------------------------------
CREATE TABLE `companies` (
    `id`          CHAR(36)        NOT NULL,
    `name`        VARCHAR(200)    NOT NULL,
    `slug`        VARCHAR(200)    NOT NULL,
    `city`        VARCHAR(50)     DEFAULT NULL,
    `category`    VARCHAR(100)    DEFAULT NULL,
    `description` TEXT            DEFAULT NULL,
    `review_count` INT            NOT NULL DEFAULT 0,
    `avg_rating`  DECIMAL(2,1)    DEFAULT NULL,
    `status`      ENUM('ACTIVE','PENDING_VERIFICATION','INACTIVE') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_slug` (`slug`),
    KEY `idx_companies_status` (`status`),
    KEY `idx_companies_category` (`category`),
    KEY `idx_companies_city` (`city`),
    KEY `idx_companies_avg_rating` (`avg_rating`),
    KEY `idx_companies_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公司表';

-- -----------------------------------------------------------------------------
-- 3. reviews
-- -----------------------------------------------------------------------------
CREATE TABLE `reviews` (
    `id`                CHAR(36)        NOT NULL,
    `user_id`           CHAR(36)        NOT NULL,
    `company_id`        CHAR(36)        NOT NULL,
    `job_title`         VARCHAR(100)    NOT NULL,
    `start_date`        VARCHAR(7)      NOT NULL COMMENT 'YYYY-MM format',
    `end_date`          VARCHAR(7)      DEFAULT NULL COMMENT 'YYYY-MM format, NULL = still employed',
    `employment_type`   ENUM('FULL_TIME','PART_TIME','INTERN','CONTRACT','FREELANCE') NOT NULL,
    `content`           TEXT            NOT NULL,
    `rating_overall`    TINYINT         DEFAULT NULL,
    `rating_salary`     TINYINT         DEFAULT NULL,
    `rating_environment` TINYINT        DEFAULT NULL,
    `rating_growth`     TINYINT         DEFAULT NULL,
    `rating_management` TINYINT         DEFAULT NULL,
    `rating_work_life`  TINYINT         DEFAULT NULL,
    `audit_status`      ENUM('PENDING','MACHINE_APPROVED','MACHINE_REJECTED','HUMAN_APPROVED','HUMAN_REJECTED','NEED_MODIFY') NOT NULL DEFAULT 'PENDING',
    `publish_status`    ENUM('DRAFT','PUBLISHED','HIDDEN','REMOVED') NOT NULL DEFAULT 'DRAFT',
    `is_anonymous`      BOOLEAN         NOT NULL DEFAULT FALSE,
    `publish_ip`        VARCHAR(45)     DEFAULT NULL,
    `sensitive_check`   JSON            DEFAULT NULL COMMENT 'Sensitive word check result snapshot',
    `created_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_reviews_user_id` (`user_id`),
    KEY `idx_reviews_company_id` (`company_id`),
    KEY `idx_reviews_audit_status` (`audit_status`),
    KEY `idx_reviews_publish_status` (`publish_status`),
    KEY `idx_reviews_created_at` (`created_at`),
    KEY `idx_reviews_overall` (`rating_overall`),
    KEY `idx_reviews_company_published` (`company_id`, `publish_status`),
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- -----------------------------------------------------------------------------
-- 4. review_evidences
-- -----------------------------------------------------------------------------
CREATE TABLE `review_evidences` (
    `id`                  CHAR(36)        NOT NULL,
    `review_id`           CHAR(36)        NOT NULL,
    `file_type`           ENUM('IMAGE','PDF','SCREENSHOT','OTHER') NOT NULL,
    `file_path`           VARCHAR(500)    NOT NULL,
    `original_filename`   VARCHAR(255)    DEFAULT NULL,
    `file_size`           INT             DEFAULT NULL COMMENT 'bytes',
    `ocr_result`          JSON            DEFAULT NULL,
    `privacy_check_status` ENUM('PASSED','BLOCKED','PENDING') NOT NULL DEFAULT 'PENDING',
    `authenticity_score`  DECIMAL(3,2)   DEFAULT NULL,
    `created_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_evidences_review_id` (`review_id`),
    KEY `idx_evidences_privacy_status` (`privacy_check_status`),
    CONSTRAINT `fk_evidences_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价证明材料表';

-- -----------------------------------------------------------------------------
-- 5. audit_records
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_records` (
    `id`             CHAR(36)        NOT NULL,
    `review_id`      CHAR(36)        NOT NULL,
    `audit_type`     ENUM('MACHINE','HUMAN') NOT NULL,
    `audit_result`   ENUM('APPROVED','REJECTED','NEED_MODIFY') NOT NULL,
    `sensitive_words` JSON           DEFAULT NULL,
    `auditor_id`     CHAR(36)        DEFAULT NULL COMMENT 'NULL for machine audit',
    `reject_reason`  TEXT            DEFAULT NULL,
    `audit_ip`       VARCHAR(45)     DEFAULT NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_review_id` (`review_id`),
    KEY `idx_audit_auditor_id` (`auditor_id`),
    KEY `idx_audit_type` (`audit_type`),
    KEY `idx_audit_created_at` (`created_at`),
    CONSTRAINT `fk_audit_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_audit_auditor` FOREIGN KEY (`auditor_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审核记录表';

-- -----------------------------------------------------------------------------
-- 6. sensitive_words
-- -----------------------------------------------------------------------------
CREATE TABLE `sensitive_words` (
    `id`        INT             NOT NULL AUTO_INCREMENT,
    `word`      VARCHAR(100)    NOT NULL,
    `category`  ENUM('INSULT','DEFAMATION','PRIVACY','POLITICAL','OTHER') NOT NULL DEFAULT 'OTHER',
    `severity`  ENUM('BLOCK','WARN','REVIEW') NOT NULL DEFAULT 'REVIEW',
    `is_active` BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sensitive_word` (`word`),
    KEY `idx_sensitive_category` (`category`),
    KEY `idx_sensitive_severity` (`severity`),
    KEY `idx_sensitive_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='敏感词库表';

-- -----------------------------------------------------------------------------
-- 7. complaint_tickets
-- -----------------------------------------------------------------------------
CREATE TABLE `complaint_tickets` (
    `id`               CHAR(36)        NOT NULL,
    `ticket_no`        VARCHAR(20)     NOT NULL,
    `company_name`     VARCHAR(200)    NOT NULL,
    `complainant_name` VARCHAR(100)    NOT NULL,
    `complainant_phone` VARCHAR(20)    NOT NULL,
    `complaint_type`   ENUM('DEFAMATION','FALSE_INFO','PRIVACY_VIOLATION','INTELLECTUAL_PROPERTY','OTHER') NOT NULL,
    `target_type`      ENUM('REVIEW','COMPANY') NOT NULL,
    `target_id`        CHAR(36)        NOT NULL,
    `reason`           TEXT            NOT NULL,
    `status`           ENUM('PENDING','PROCESSING','RESOLVED','DISMISSED') NOT NULL DEFAULT 'PENDING',
    `deadline_at`      TIMESTAMP       NULL DEFAULT NULL,
    `handler_id`       CHAR(36)        DEFAULT NULL,
    `handle_result`    ENUM('REMOVED','RETAINED','DISMISSED') DEFAULT NULL,
    `handle_note`      TEXT            DEFAULT NULL,
    `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ticket_no` (`ticket_no`),
    KEY `idx_complaint_status` (`status`),
    KEY `idx_complaint_handler_id` (`handler_id`),
    KEY `idx_complaint_target` (`target_type`, `target_id`),
    KEY `idx_complaint_deadline` (`deadline_at`),
    KEY `idx_complaint_created_at` (`created_at`),
    CONSTRAINT `fk_complaint_handler` FOREIGN KEY (`handler_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投诉工单表';

-- -----------------------------------------------------------------------------
-- 8. complaint_materials
-- -----------------------------------------------------------------------------
CREATE TABLE `complaint_materials` (
    `id`            CHAR(36)        NOT NULL,
    `ticket_id`     CHAR(36)        NOT NULL,
    `material_type` ENUM('BUSINESS_LICENSE','SCREENSHOT','EVIDENCE','OTHER') NOT NULL,
    `file_path`     VARCHAR(500)    NOT NULL,
    `verify_status` ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_materials_ticket_id` (`ticket_id`),
    KEY `idx_materials_verify_status` (`verify_status`),
    CONSTRAINT `fk_materials_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `complaint_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投诉材料表';

-- -----------------------------------------------------------------------------
-- 9. operation_logs
-- -----------------------------------------------------------------------------
CREATE TABLE `operation_logs` (
    `id`              BIGINT          NOT NULL AUTO_INCREMENT,
    `user_id`         CHAR(36)        DEFAULT NULL,
    `action`          VARCHAR(100)    NOT NULL,
    `target_type`     VARCHAR(50)     DEFAULT NULL,
    `target_id`       VARCHAR(36)     DEFAULT NULL,
    `request_ip`      VARCHAR(45)     DEFAULT NULL,
    `request_body`    TEXT            DEFAULT NULL,
    `response_status` INT             DEFAULT NULL,
    `user_agent`      VARCHAR(500)    DEFAULT NULL,
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_oplog_user_id` (`user_id`),
    KEY `idx_oplog_action` (`action`),
    KEY `idx_oplog_target` (`target_type`, `target_id`),
    KEY `idx_oplog_created_at` (`created_at`),
    KEY `idx_oplog_response_status` (`response_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- -----------------------------------------------------------------------------
-- 10. risk_alerts
-- -----------------------------------------------------------------------------
CREATE TABLE `risk_alerts` (
    `id`         CHAR(36)        NOT NULL,
    `alert_type` ENUM('BATCH_REVIEW','MASS_NEGATIVE','SAME_IP','ABNORMAL_PATTERN','PAID_DELETE_SUSPECT','DATA_EXPORT_SUSPECT') NOT NULL,
    `severity`   ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `alert_detail` JSON          DEFAULT NULL,
    `status`     ENUM('OPEN','ACKNOWLEDGED','RESOLVED','DISMISSED') NOT NULL DEFAULT 'OPEN',
    `handled_by` CHAR(36)        DEFAULT NULL,
    `handled_at` TIMESTAMP       NULL DEFAULT NULL,
    `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_risk_alert_type` (`alert_type`),
    KEY `idx_risk_severity` (`severity`),
    KEY `idx_risk_status` (`status`),
    KEY `idx_risk_handled_by` (`handled_by`),
    KEY `idx_risk_created_at` (`created_at`),
    CONSTRAINT `fk_risk_handler` FOREIGN KEY (`handled_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='风险预警表';

-- -----------------------------------------------------------------------------
-- 11. judicial_exports
-- -----------------------------------------------------------------------------
CREATE TABLE `judicial_exports` (
    `id`                     CHAR(36)        NOT NULL,
    `export_no`              VARCHAR(30)     NOT NULL,
    `requester_id`           CHAR(36)        NOT NULL,
    `court_order_no`         VARCHAR(100)    NOT NULL,
    `query_params`           JSON            DEFAULT NULL,
    `export_data`            LONGTEXT        DEFAULT NULL,
    `decryption_approval_id` CHAR(36)        DEFAULT NULL,
    `status`                 ENUM('PENDING_APPROVAL','APPROVED','EXPORTED','REVOKED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `created_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_export_no` (`export_no`),
    KEY `idx_judicial_requester` (`requester_id`),
    KEY `idx_judicial_status` (`status`),
    KEY `idx_judicial_court_order` (`court_order_no`),
    CONSTRAINT `fk_judicial_requester` FOREIGN KEY (`requester_id`) REFERENCES `admins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司法导出表';

-- -----------------------------------------------------------------------------
-- 12. admins
-- -----------------------------------------------------------------------------
CREATE TABLE `admins` (
    `id`            CHAR(36)        NOT NULL,
    `username`      VARCHAR(50)     NOT NULL,
    `password_hash` VARCHAR(255)    NOT NULL,
    `role`          ENUM('SUPER_ADMIN','AUDITOR','COMPLAINT_HANDLER','RISK_ANALYST') NOT NULL DEFAULT 'AUDITOR',
    `status`        ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_username` (`username`),
    KEY `idx_admin_role` (`role`),
    KEY `idx_admin_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- -----------------------------------------------------------------------------
-- 13. user_penalties
-- -----------------------------------------------------------------------------
CREATE TABLE `user_penalties` (
    `id`          CHAR(36)        NOT NULL,
    `user_id`     CHAR(36)        NOT NULL,
    `penalty_type` ENUM('WARNING','MUTE','TEMP_BAN','PERMANENT_BAN') NOT NULL,
    `reason`      TEXT            NOT NULL,
    `operator_id` CHAR(36)        NOT NULL,
    `start_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `end_at`      TIMESTAMP       NULL DEFAULT NULL,
    `is_active`   BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_penalty_user_id` (`user_id`),
    KEY `idx_penalty_operator_id` (`operator_id`),
    KEY `idx_penalty_type` (`penalty_type`),
    KEY `idx_penalty_active` (`is_active`),
    KEY `idx_penalty_end_at` (`end_at`),
    CONSTRAINT `fk_penalty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_penalty_operator` FOREIGN KEY (`operator_id`) REFERENCES `admins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户处罚记录表';

-- -----------------------------------------------------------------------------
-- 14. data_retention_policies
-- -----------------------------------------------------------------------------
CREATE TABLE `data_retention_policies` (
    `id`             INT             NOT NULL AUTO_INCREMENT,
    `table_name`     VARCHAR(100)    NOT NULL,
    `retention_days` INT             NOT NULL DEFAULT 1095,
    `archive_action` ENUM('DELETE','ANONYMIZE','ARCHIVE') NOT NULL DEFAULT 'ANONYMIZE',
    `is_active`      BOOLEAN         NOT NULL DEFAULT TRUE,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_table_name` (`table_name`),
    KEY `idx_retention_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据留存策略表';

-- -----------------------------------------------------------------------------
-- Insert default data retention policies
-- -----------------------------------------------------------------------------
INSERT INTO `data_retention_policies` (`table_name`, `retention_days`, `archive_action`, `is_active`) VALUES
('users',                  3650, 'ANONYMIZE', TRUE),
('reviews',                1825, 'ANONYMIZE', TRUE),
('review_evidences',       1825, 'DELETE',    TRUE),
('audit_records',          1095, 'ARCHIVE',   TRUE),
('operation_logs',          730, 'ARCHIVE',   TRUE),
('complaint_tickets',      1095, 'ARCHIVE',   TRUE),
('complaint_materials',    1095, 'DELETE',    TRUE),
('risk_alerts',             730, 'ARCHIVE',   TRUE),
('judicial_exports',       1825, 'ARCHIVE',   TRUE),
('user_penalties',         1825, 'ARCHIVE',   TRUE);

SET FOREIGN_KEY_CHECKS = 1;