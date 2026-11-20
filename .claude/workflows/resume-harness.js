export const meta = {
  name: 'resume-harness',
  description: '작성팀이 경력기술서를 쓰고 면접관팀이 검증한 뒤, 기준 점수 미달이면 피드백을 반영한다',
  whenToUse: 'input/에 원자료를 넣은 뒤 경력기술서 초안 작성과 모의 면접 검증을 돌릴 때',
  phases: [
    { title: '작성팀', detail: '경력분석·성과작성·직무매칭 팬아웃 후 편집장 병합' },
    { title: '면접관팀', detail: '기술·HR·실무팀장 팬아웃 후 위원장 종합' },
    { title: '피드백 반영', detail: '점수 미달 시 편집장 수정 → 위원장 재채점' },
  ],
}

// 인자: { threshold?: number (기본 80), maxRounds?: number (기본 1) }
const threshold = (args && args.threshold) || 80
const maxRounds = args && args.maxRounds !== undefined ? args.maxRounds : 1

const P1 = 'workspace/shared/phase1'
const P2 = 'workspace/shared/phase2'

const CHAIR_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number', description: '0~100 최종 점수' },
    passed: { type: 'boolean' },
    revisions: { type: 'array', items: { type: 'string' }, description: '영향이 큰 순서의 구체적 수정 요청' },
    summary: { type: 'string', description: '3줄 이내 종합 평가' },
  },
  required: ['score', 'passed', 'revisions', 'summary'],
}

// ── Phase 1: 작성팀 팬아웃 (각자 공유 보드에 기록) → 편집장 병합
phase('작성팀')
const WRITERS = ['career-analyst', 'impact-writer', 'jd-matcher']
const drafts = await parallel(WRITERS.map(name => () =>
  agent(`input/ 원자료로 당신의 역할을 수행하고 결과를 ${P1}/${name}.md에 쓰세요.`,
    { agentType: name, label: name, phase: '작성팀' })))
const missing = WRITERS.filter((_, i) => !drafts[i])
if (missing.length === WRITERS.length) {
  return { error: '작성팀 에이전트가 모두 실패했습니다. input/에 원자료가 있는지 확인하세요.' }
}
if (missing.length) log(`실패한 작성팀 에이전트: ${missing.join(', ')} (나머지 결과로 진행)`)

await agent(`${P1}/의 팀원 결과를 모두 읽고 workspace/resume.md 초안을 작성하세요.`,
  { agentType: 'resume-editor', label: 'resume-editor(초안)', phase: '작성팀' })

// ── Phase 2: 면접관팀 팬아웃 → 위원장 종합
phase('면접관팀')
const INTERVIEWERS = ['tech-interviewer', 'hr-interviewer', 'hiring-manager']
await parallel(INTERVIEWERS.map(name => () =>
  agent(`workspace/resume.md를 검증하고 결과를 ${P2}/${name}.md에 쓰세요.`,
    { agentType: name, label: name, phase: '면접관팀' })))

const chairPrompt = round =>
  `면접관 평가 파일 ${INTERVIEWERS.map(n => `${P2}/${n}.md`).join(', ')}를 종합하세요. ` +
  (round > 0 ? `편집장이 수정을 반영했으니 ${P2}/editor-response.md와 수정된 workspace/resume.md 기준으로 재채점하세요. ` : '') +
  `종합 평가는 ${P2}/chair-round${round}.md에 쓰고, 통과 기준은 ${threshold}점입니다.`

let verdict = await agent(chairPrompt(0),
  { agentType: 'interview-chair', label: 'interview-chair', phase: '면접관팀', schema: CHAIR_SCHEMA })
if (!verdict) return { error: '면접 위원장 종합이 실패했습니다.' }
const history = [{ round: 0, score: verdict.score }]

// ── Phase 3: 기준 미달이면 편집장 수정 → 위원장 재채점 (maxRounds회까지)
phase('피드백 반영')
for (let round = 1; round <= maxRounds && verdict.score < threshold; round++) {
  log(`${round}차 수정: 점수 ${verdict.score} < ${threshold}`)
  await agent(`면접관팀 수정 요청을 반영하세요:\n${verdict.revisions.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
    { agentType: 'resume-editor', label: `resume-editor(${round}차 수정)`, phase: '피드백 반영' })
  const next = await agent(chairPrompt(round),
    { agentType: 'interview-chair', label: `interview-chair(${round}차 재채점)`, phase: '피드백 반영', schema: CHAIR_SCHEMA })
  if (!next) { log('재채점 실패, 직전 평가로 종료'); break }
  verdict = next
  history.push({ round, score: verdict.score })
}
if (verdict.score < threshold) log(`최대 반복(${maxRounds}회) 후에도 ${threshold}점 미만입니다. [수치 필요]/확인 필요 항목을 직접 채워 주세요.`)

return {
  passed: verdict.score >= threshold,
  score: verdict.score,
  history,
  summary: verdict.summary,
  remainingRevisions: verdict.revisions,
  files: ['workspace/resume.md', 'workspace/interview-questions.md'],
}
