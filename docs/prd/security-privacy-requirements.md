# Security & Privacy Requirements

## Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-A1 | Supabase Auth (email + OAuth) | M |
| SEC-A2 | JWT token expiration | 7 days | M |
| SEC-A3 | Refresh token rotation | M |
| SEC-A4 | Multi-factor auth | W (Post-MVP) |

## Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-Z1 | Row Level Security (RLS) on all user tables | M |
| SEC-Z2 | Users can only access own data | M |
| SEC-Z3 | API endpoint authorization | M |

## Data Protection

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-D1 | Data encrypted at rest | M |
| SEC-D2 | Data encrypted in transit (TLS 1.3) | M |
| SEC-D3 | PII encryption | M |
| SEC-D4 | Supabase Storage security (signed URLs) | M |

## Input Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-I1 | Input sanitization (XSS prevention) | M |
| SEC-I2 | SQL injection prevention (parameterized queries) | M |
| SEC-I3 | File upload validation (type, size) | M |
| SEC-I4 | Rate limiting on all endpoints | M |

## Privacy Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PRI-1 | Privacy policy link in app | M |
| PRI-2 | GDPR compliance (EU users) | M |
| PRI-3 | Data export capability | M |
| PRI-4 | Account deletion capability | M |
| PRI-5 | Analytics opt-out option | S |

---
