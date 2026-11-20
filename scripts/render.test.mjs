import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render } from './render.mjs';

test('자리표시자를 환경변수 값으로 치환한다', () => {
  const { output, missing } = render('# {{RESUME_NAME}}\n{{RESUME_EMAIL}} / {{RESUME_NAME}}', {
    RESUME_NAME: '홍길동',
    RESUME_EMAIL: 'test@example.com',
  });
  assert.equal(output, '# 홍길동\ntest@example.com / 홍길동');
  assert.deepEqual(missing, []);
});

test('미설정 또는 빈 변수는 이름만 중복 없이 보고하고 원문을 유지한다', () => {
  const { output, missing } = render('{{RESUME_PHONE}} {{RESUME_GITHUB}} {{RESUME_PHONE}}', { RESUME_GITHUB: '  ' });
  assert.equal(output, '{{RESUME_PHONE}} {{RESUME_GITHUB}} {{RESUME_PHONE}}');
  assert.deepEqual(missing, ['RESUME_PHONE', 'RESUME_GITHUB']);
});

test('RESUME_ 접두사가 아닌 중괄호는 건드리지 않는다', () => {
  const { output, missing } = render('{{OTHER}} {{resume_name}}', { OTHER: 'x' });
  assert.equal(output, '{{OTHER}} {{resume_name}}');
  assert.deepEqual(missing, []);
});
