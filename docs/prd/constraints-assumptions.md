# Constraints & Assumptions

## Constraints

| ID | Constraint | Impact |
|----|------------|--------|
| CON-1 | iOS only for MVP | No Android users initially |
| CON-2 | English only for MVP | No localization |
| CON-3 | US market focus | Timezone/payment considerations |
| CON-4 | 2-person engineering team | Limited velocity |
| CON-5 | AI budget: $2,500/month at 10K users | Model selection constraints |
| CON-6 | Max 3 active goals | Product design constraint |

## Assumptions

| ID | Assumption | Risk if False |
|----|------------|---------------|
| ASM-1 | Users will complete onboarding in one session | High abandonment |
| ASM-2 | Users will journal daily | Core loop breaks |
| ASM-3 | AI coaching provides differentiated value | No conversion |
| ASM-4 | $12/month is acceptable price for students | Revenue targets missed |
| ASM-5 | Push notifications drive engagement | Retention suffers |
| ASM-6 | Trust-based proof is sufficient | Accountability fails |

## Technical Assumptions

- Supabase can handle projected scale (10K users)
- Railway provides adequate backend performance
- OpenAI/Anthropic API availability is stable
- React Native performance is acceptable on target devices

---
