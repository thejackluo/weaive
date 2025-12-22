# Dependencies & Risks

## External Dependencies

| ID | Dependency | Type | Mitigation |
|----|------------|------|------------|
| DEP-1 | Supabase | Infrastructure | Monitor status, backup plan |
| DEP-2 | Railway | Infrastructure | Monitor status, backup plan |
| DEP-3 | OpenAI API | AI Provider | Anthropic as backup |
| DEP-4 | Apple App Store | Distribution | Follow guidelines strictly |
| DEP-5 | APNs | Push Notifications | Graceful degradation |

## Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| RSK-1 | AI costs exceed budget | Medium | High | Aggressive caching, model routing |
| RSK-2 | Low retention (<20% D7) | Medium | High | Recovery loop, notifications |
| RSK-3 | App Store rejection | Low | High | Guidelines compliance review |
| RSK-4 | Security breach | Low | Critical | RLS, encryption, audits |
| RSK-5 | AI generates harmful content | Low | High | Safety filters, guardrails |
| RSK-6 | Competitor copies features | Medium | Medium | Speed of execution, moats |
| RSK-7 | Free-to-paid conversion <2% | Medium | High | A/B test free tier limits |

---
