# 경력기술서 하네스

명세: @../spec.md

## 포인터
- 작성팀 에이전트: .claude/agents/career-analyst.md, impact-writer.md, jd-matcher.md, resume-editor.md(리드)
- 면접관팀 에이전트: .claude/agents/tech-interviewer.md, hr-interviewer.md, hiring-manager.md, interview-chair.md(리드)
- 워크플로: .claude/workflows/resume-harness.js (실행: Workflow name "resume-harness", args { threshold, maxRounds })
- 공유 보드: workspace/shared/phase1/, workspace/shared/phase2/
- 결과물: workspace/resume.md, workspace/interview-questions.md
- 원자료: input/ (안내: @../input/README.md)
- 입력 템플릿: templates/career.md, templates/project.md (input/에 복사해서 채움. 원본은 원자료가 아님)
- 개인정보 치환: scripts/render.mjs, 변수 목록 env.example

## 규칙
- .env, output/ 은 읽지 않는다. 개인정보는 {{RESUME_*}} 자리표시자로만 쓴다.
- npm run render 는 사용자가 직접 실행한다 (Claude 실행 금지, settings.json deny).
- 코드 변경 후 npm test 실행.
