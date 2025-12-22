# Appendices

## Appendix A: Terminology Glossary

| Term | Definition |
|------|------------|
| Active Day | Day with ≥1 bind completed + proof or journal |
| Bind | Daily action/habit toward a goal (technical: subtask) |
| Capture | Proof or memory (photo, note, voice) |
| Dream Self | User's ideal future identity, informs AI voice |
| Needle | User's goal (max 3 active) |
| Q-Goal | Quantifiable subgoal with metrics |
| Thread | User's starting state and identity |
| Triad | AI-generated 3 tasks for next day |
| Weave | User's evolved state, progress visualization |

## Appendix B: API Endpoints (Summary)

**Authentication:**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

**Users:**
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/identity`
- `PATCH /users/me/identity`

**Goals:**
- `GET /goals`
- `POST /goals`
- `GET /goals/{id}`
- `PATCH /goals/{id}`
- `DELETE /goals/{id}`

**Subtasks:**
- `GET /subtasks/today`
- `POST /subtasks/{id}/complete`
- `POST /subtasks/{id}/proof`

**Journals:**
- `GET /journals`
- `POST /journals`
- `GET /journals/{date}`

**AI:**
- `POST /ai/chat`
- `GET /ai/triad`
- `GET /ai/recap`
- `GET /ai/insights`

## Appendix C: Database Schema Reference

See `docs/idea/backend.md` for complete schema documentation.

## Appendix D: UI/UX Specifications

See `docs/idea/ux.md` for complete screen specifications.

## Appendix E: AI Architecture

See `docs/idea/ai.md` for complete AI system documentation.

---
