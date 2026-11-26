-- Insert test user with BCrypt encoded password
-- Password: "admin123" encoded with BCrypt
INSERT INTO users (id, email, password, role) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@talentscope.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'SUPER_ADMIN'
);

-- Insert test candidates
INSERT INTO candidates (id, first_name, last_name, email, phone, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'John', 'Doe', 'john.doe@email.com', '+1234567890', 'PENDING'),
('22222222-2222-2222-2222-222222222222', 'Jane', 'Smith', 'jane.smith@email.com', '+0987654321', 'INTERVIEW'),
('33333333-3333-3333-3333-333333333333', 'Bob', 'Wilson', 'bob.wilson@email.com', '+1122334455', 'HIRED'),
('44444444-4444-4444-4444-444444444444', 'Alice', 'Brown', 'alice.brown@email.com', '+5566778899', 'REJECTED');

DELETE FROM users WHERE role = 'ADMIN';

{
  "email": "stagiaire@talentscope.com",
  "password": "stagiaire123",
  "role": "STAGIAIRE",
  "encadrantId": "encadrant-uuid"
}

{
  "email": "encadrant@talentscope.com",
  "password": "encadrant123",
  "role": "ENCADRANT"
}

{
  "email": "rh@talentscope.com",
  "password": "rh123",
  "role": "RH"
}
$bytes = New-Object byte[] 64
$rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Set-Clipboard -Value $secret
$rng.Dispose()
Write-Host "JWT_SECRET generated and copied successfully!"