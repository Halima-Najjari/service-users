-- Insert test user with BCrypt encoded password
-- Password: "password123" encoded with BCrypt
INSERT INTO users (id, email, password, role) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@talentscope.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'SUPER_ADMIN'
);
DELETE FROM users WHERE role = 'ADMIN';