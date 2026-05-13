-- FoundIt Database Schema
-- PRJ566 NCC Team 2
-- Based on SRS Section 5.2 Data Dictionary

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- ENUMS
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TYPE user_role               AS ENUM ('student', 'security', 'admin');
CREATE TYPE item_status             AS ENUM ('pending_report', 'stored', 'claimed', 'expired', 'disposed');
CREATE TYPE claim_status            AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'picked_up');
CREATE TYPE found_report_status     AS ENUM ('submitted', 'processed', 'linked_to_item');
CREATE TYPE match_status            AS ENUM ('suggested', 'confirmed', 'rejected', 'dismissed');
CREATE TYPE notification_type       AS ENUM ('claim_status_update', 'match_found', 'item_expiring', 'report_confirmation');
CREATE TYPE email_delivery_status   AS ENUM ('not_sent', 'sent', 'delivered', 'failed');


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- CAMPUS  (SRS 5.2.2)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE campus (
    campus_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_name     VARCHAR(100) NOT NULL UNIQUE,           -- e.g. "Newnham", "Seneca@York"
    address         VARCHAR(255),
    retention_days  INT          NOT NULL DEFAULT 30,       -- configurable, up to 90 days
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- USER  (SRS 5.2.1)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE "user" (
    user_id                     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id                   UUID         REFERENCES campus(campus_id) ON DELETE SET NULL,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    username                    VARCHAR(255) NOT NULL UNIQUE,
    password_hash               VARCHAR(255) NOT NULL,
    role                        user_role    NOT NULL,                   -- student | security | admin (BR2)
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    student_number              VARCHAR(20)  UNIQUE,                     -- only for students (BR14)
    employee_id                 VARCHAR(20)  UNIQUE,                     -- only for security
    phone                       VARCHAR(20),
    email_notification_opt_in   BOOLEAN      NOT NULL DEFAULT FALSE,     -- BR18
    is_active                   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_student_number ON "user"(student_number) WHERE student_number IS NOT NULL;
CREATE INDEX        idx_user_campus_id      ON "user"(campus_id);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- REPORT LINK  (SRS 5.2.7)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE report_link (
    link_id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    token           VARCHAR(255) NOT NULL UNIQUE,
    generated_by    UUID         NOT NULL REFERENCES "user"(user_id),
    campus_id       UUID         NOT NULL REFERENCES campus(campus_id),
    expires_at      TIMESTAMP    NOT NULL,                  -- BR10
    is_used         BOOLEAN      NOT NULL DEFAULT FALSE,
    used_at         TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- FOUND ITEM REPORT  (SRS 5.2.6)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE found_item_report (
    report_id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_link_id      UUID        NOT NULL REFERENCES report_link(link_id),
    finder_id           UUID        NOT NULL REFERENCES "user"(user_id),
    item_description    TEXT        NOT NULL,
    category            VARCHAR(50) NOT NULL,
    location_found      VARCHAR(255) NOT NULL,
    date_found          DATE        NOT NULL,
    time_found          TIME,
    additional_notes    TEXT,
    status              found_report_status NOT NULL DEFAULT 'submitted',
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- ITEM  (SRS 5.2.3)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE item (
    item_id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id               UUID        NOT NULL REFERENCES campus(campus_id),
    category                VARCHAR(50) NOT NULL,
    title                   VARCHAR(100) NOT NULL,          -- BR7
    description_public      VARCHAR(255),                   -- limited info for students (BR7)
    description_internal    TEXT,                           -- detailed info for security only (BR12)
    color                   VARCHAR(30),
    brand                   VARCHAR(50),
    location_found          VARCHAR(255),
    date_found              DATE        NOT NULL,
    status                  item_status NOT NULL DEFAULT 'pending_report',
    found_item_report_id    UUID        REFERENCES found_item_report(report_id),
    registered_by           UUID        NOT NULL REFERENCES "user"(user_id),
    retention_expiry_date   DATE,                           -- computed: date_found + campus.retention_days
    created_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_campus_id          ON item(campus_id);
CREATE INDEX idx_item_category           ON item(category);
CREATE INDEX idx_item_status             ON item(status);
CREATE INDEX idx_item_date_found         ON item(date_found);
CREATE INDEX idx_item_retention_expiry   ON item(retention_expiry_date);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- CLAIM  (SRS 5.2.5)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE claim (
    claim_id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID        NOT NULL REFERENCES "user"(user_id),
    item_id             UUID        REFERENCES item(item_id),           -- may be NULL initially
    category            VARCHAR(50) NOT NULL,
    campus_id           UUID        NOT NULL REFERENCES campus(campus_id),
    description         TEXT        NOT NULL,                           -- BR4
    date_lost           DATE,
    location_lost       VARCHAR(255),
    status              claim_status NOT NULL DEFAULT 'submitted',      -- BR19
    reviewed_by         UUID        REFERENCES "user"(user_id),
    reviewed_at         TIMESTAMP,
    rejection_reason    TEXT,
    picked_up_at        TIMESTAMP,                                      -- BR15
    verified_by         UUID        REFERENCES "user"(user_id),        -- BR14
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claim_student_id   ON claim(student_id);
CREATE INDEX idx_claim_item_id      ON claim(item_id);
CREATE INDEX idx_claim_campus_id    ON claim(campus_id);
CREATE INDEX idx_claim_status       ON claim(status);
CREATE INDEX idx_claim_reviewed_by  ON claim(reviewed_by);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- ITEM IMAGE  (SRS 5.2.4)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE item_image (
    image_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id         UUID         REFERENCES item(item_id)   ON DELETE CASCADE,
    claim_id        UUID         REFERENCES claim(claim_id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    uploaded_by     UUID         NOT NULL REFERENCES "user"(user_id),
    file_type       VARCHAR(10)  NOT NULL,                  -- BR6: JPG, PNG only
    file_size_kb    INT          NOT NULL,                  -- BR6: size-limited
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT item_image_target_check
        CHECK (item_id IS NOT NULL OR claim_id IS NOT NULL)
);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- MATCH SUGGESTION  (SRS 5.2.8)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE match_suggestion (
    match_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id        UUID         NOT NULL REFERENCES claim(claim_id),
    item_id         UUID         NOT NULL REFERENCES item(item_id),
    match_score     DECIMAL(5,2) NOT NULL,                  -- 0.00–100.00
    match_criteria  TEXT,
    status          match_status NOT NULL DEFAULT 'suggested',
    reviewed_by     UUID         REFERENCES "user"(user_id),
    reviewed_at     TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_match_claim_item UNIQUE (claim_id, item_id)
);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- NOTIFICATION  (SRS 5.2.9)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE notification (
    notification_id         UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id            UUID                  NOT NULL REFERENCES "user"(user_id),
    type                    notification_type     NOT NULL,
    title                   VARCHAR(255)          NOT NULL,
    message                 TEXT                  NOT NULL,
    reference_type          VARCHAR(50),                    -- claim | item | report
    reference_id            UUID,
    is_read                 BOOLEAN               NOT NULL DEFAULT FALSE,
    email_sent              BOOLEAN               NOT NULL DEFAULT FALSE,
    email_sent_at           TIMESTAMP,
    email_delivery_status   email_delivery_status NOT NULL DEFAULT 'not_sent',
    created_at              TIMESTAMP             NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_recipient ON notification(recipient_id);
CREATE INDEX idx_notification_is_read   ON notification(recipient_id, is_read);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- AUDIT LOG  (SRS 5.2.10)  — append-only, no UPDATE or DELETE
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE TABLE audit_log (
    log_id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id        UUID         REFERENCES "user"(user_id),  -- NULL for system actions
    action          VARCHAR(100) NOT NULL,      -- e.g. item_created, claim_approved
    entity_type     VARCHAR(50)  NOT NULL,      -- item | claim | report | user | report_link
    entity_id       UUID         NOT NULL,
    details         JSON,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor_id   ON audit_log(actor_id);
CREATE INDEX idx_audit_entity     ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action     ON audit_log(action);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- AUTO-UPDATE updated_at TRIGGER
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_item_updated_at
    BEFORE UPDATE ON item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_claim_updated_at
    BEFORE UPDATE ON claim
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
