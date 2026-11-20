// workspace/resume.md의 {{RESUME_*}} 자리표시자를 환경변수 값으로 치환해 output/resume.final.md로 저장한다.
// 개인정보는 이 스크립트(로컬)에서만 다루며 에이전트에게 전달되지 않는다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const PLACEHOLDER = /\{\{(RESUME_[A-Z_]+)\}\}/g;

/** 치환 결과와 값이 없는(미설정 또는 빈 문자열) 변수 이름 목록을 반환한다. */
export function render(text, env) {
  const missing = new Set();
  const output = text.replace(PLACEHOLDER, (match, key) => {
    const value = env[key];
    if (value === undefined || value.trim() === '') {
      missing.add(key);
      return match;
    }
    return value;
  });
  return { output, missing: [...missing] };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [src = 'workspace/resume.md', dest = 'output/resume.final.md'] = process.argv.slice(2);
  let text;
  try {
    text = readFileSync(src, 'utf8');
  } catch {
    console.error(`원본 파일을 읽을 수 없습니다: ${src} (워크플로를 먼저 실행하세요)`);
    process.exit(1);
  }
  const { output, missing } = render(text, process.env);
  if (missing.length) {
    // 값은 출력하지 않고 빠진 변수 이름만 알린다.
    console.error(`설정되지 않은 환경변수: ${missing.join(', ')}`);
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, output, 'utf8');
  console.log(`생성 완료: ${dest}`);
}
