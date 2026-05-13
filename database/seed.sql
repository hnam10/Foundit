-- FoundIt Seed Data
-- Initial data: campuses and admin user
-- Run AFTER schema.sql

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- CAMPUSES
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

INSERT INTO campus (campus_name, address, retention_days) VALUES
    ('Newnham',     '1750 Finch Ave E, Toronto, ON M2J 2X5',          30),
    ('Seneca@York', '70 The Pond Rd, Toronto, ON M3J 3M6',            30),
    ('King',        '13990 Dufferin St, King City, ON L7B 1B3',        30),
    ('Peterborough','1717 Lansdowne St W, Peterborough, ON K9J 7B1',   30)
ON CONFLICT (campus_name) DO NOTHING;


-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
-- ADMIN USER
-- password: Admin123! (bcrypt hashed — change in production)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

INSERT INTO "user" (email, username, password_hash, role, first_name, last_name, campus_id)
VALUES (
    'admin@foundit.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeApeOQNtKgxnLbMe',
    'admin',
    'Found',
    'It',
    (SELECT campus_id FROM campus WHERE campus_name = 'Newnham')
)
ON CONFLICT (email) DO NOTHING;
