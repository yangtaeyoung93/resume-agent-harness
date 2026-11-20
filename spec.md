# 경력기술서 하네스 명세 (spec)

## 목적
작성팀이 경력기술서를 만들고, 면접관팀이 실제 면접처럼 검증하고, 점수가 기준에 못 미치면 다시 쓰는 하네스.

## 디렉토리
| 경로 | 용도 | 누가 씀 |
|---|---|---|
| `input/` | 원자료 (기존 이력, 프로젝트 메모, JD). 개인정보 제외 | 사용자 |
| `workspace/shared/phase1/` | 작성팀 공유 보드 | 작성팀 에이전트 |
| `workspace/shared/phase2/` | 면접관팀 공유 보드 | 면접관팀 에이전트 |
| `workspace/resume.md` | 자리표시자가 들어간 경력기술서 | resume-editor |
| `workspace/interview-questions.md` | 예상 질문집 | interview-chair |
| `output/resume.final.md` | 개인정보가 채워진 최종본 | `npm run render` (로컬) |

## 흐름
1. **작성팀 (팬아웃)**: `career-analyst`, `impact-writer`, `jd-matcher`가 병렬로 `input/`을 읽고 각자 `phase1/<이름>.md`에 씀
2. **병합**: `resume-editor`가 phase1 보드를 모두 읽고 `workspace/resume.md` 작성
3. **면접관팀 (팬아웃)**: `tech-interviewer`, `hr-interviewer`, `hiring-manager`가 병렬로 경력기술서와 phase1 근거 노트를 읽고 `phase2/<이름>.md`에 씀
4. **종합**: `interview-chair`가 phase2 보드를 모두 읽고 점수(0~100)와 수정 요청을 반환하며 예상 질문집 작성
5. **피드백 반영**: 점수가 기준(기본 80) 미만이면 `resume-editor`가 수정 요청을 반영하고, `interview-chair`가 재채점. 최대 `maxRounds`회(기본 1)

## 개인정보 규칙
- 실제 개인정보는 환경변수에만 둠: `RESUME_NAME`, `RESUME_EMAIL`, `RESUME_PHONE`, `RESUME_BIRTH`, `RESUME_ADDRESS`, `RESUME_GITHUB`
- 에이전트는 `{{RESUME_NAME}}` 형식의 자리표시자만 씀. `.env`, `output/` 읽기 금지 (`.claude/settings.json` deny)
- `scripts/render.mjs`가 자리표시자를 환경변수로 치환. 값이 없거나 빈 변수가 있으면 변수 이름만 출력하고 종료 코드 1로 실패

## 실행 인자 (Workflow args)
- `threshold` (기본 80): 통과 점수
- `maxRounds` (기본 1, 최대 2 권장): 피드백 반영 횟수
