# resume-agent-harness

작성팀 에이전트가 경력기술서를 쓰고, 면접관팀 에이전트가 실제 면접처럼 검증한 뒤, 점수가 기준에 못 미치면 다시 쓰는 Claude Code 멀티 에이전트 하네스입니다.

## 구조

```
input/ (원자료)
  └─▶ 작성팀 팬아웃: career-analyst · impact-writer · jd-matcher  → workspace/shared/phase1/
        └─▶ resume-editor 병합                                   → workspace/resume.md
              └─▶ 면접관팀 팬아웃: tech-interviewer · hr-interviewer · hiring-manager → workspace/shared/phase2/
                    └─▶ interview-chair 종합 (점수 0~100, 수정 요청) → workspace/interview-questions.md
                          └─▶ 기준 미달이면 resume-editor 수정 → 재채점 (최대 maxRounds회)
```

| 경로 | 내용 |
|---|---|
| `.claude/agents/` | 에이전트 8개 정의 |
| `.claude/workflows/resume-harness.js` | 전체 흐름을 돌리는 워크플로 |
| `templates/` | 원자료 작성용 템플릿 (`career.md`, `project.md`) |
| `input/` | 원자료: 경력, 프로젝트 메모, 지원 공고(JD) |
| `workspace/` | 에이전트 결과물과 공유 보드 |
| `scripts/render.mjs` | 자리표시자를 실제 개인정보로 치환 |
| `spec.md` | 상세 명세 |

## 사용법

1. **원자료 준비**: `templates/career.md`, `templates/project.md`를 `input/`에 복사해 채우고, 지원 공고를 `input/`에 md로 넣습니다. 개인정보(이름, 연락처 등)는 쓰지 않습니다.
2. **실행**: Claude Code에서 프로젝트를 열고 이렇게 요청합니다.
   ```
   resume-harness 워크플로를 실행해줘
   ```
   인자: `threshold`(통과 점수, 기본 80), `maxRounds`(수정 반영 횟수, 기본 1).
3. **결과 확인**: `workspace/resume.md`(경력기술서), `workspace/interview-questions.md`(예상 질문집), `workspace/shared/phase2/chair-round*.md`(종합 평가).
4. **개인정보 채우기**: `env.example`을 `.env`로 복사해 값을 채운 뒤 직접 실행합니다.
   ```bash
   npm run render
   ```
   `output/resume.final.md`가 생성됩니다. 빈 변수가 있으면 변수 이름을 출력하고 실패합니다.

## 개인정보 규칙

- 실제 개인정보는 `.env`(또는 시스템 환경변수)에만 둡니다. 에이전트는 `{{RESUME_NAME}}` 같은 자리표시자만 씁니다.
- `.env`, `output/`은 에이전트가 읽지 못하게 `.claude/settings.json`에서 막혀 있고, `npm run render`도 Claude가 실행하지 못합니다.

## 테스트

```bash
npm test
```

## 요구 사항

- Claude Code (Workflow 도구 사용 가능)
- Node.js 20.6 이상 (`--env-file` 사용)
