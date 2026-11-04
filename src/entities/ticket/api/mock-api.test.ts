import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApi, emptyFilters, ApiError } from './mock-api.ts';

test('pagination returns all records once and stops', async () => {
  const api = createApi(0);
  const ids: string[] = [];
  let cursor: string | null = null;
  do {
    const page = await api.list(emptyFilters, cursor);
    ids.push(...page.items.map((ticket) => ticket.id));
    cursor = page.nextCursor;
  } while (cursor !== null);
  assert.equal(ids.length, 84);
  assert.equal(new Set(ids).size, 84);
});

test('validation preserves data; successful update changes filtered membership', async () => {
  const api = createApi(0);
  const original = await api.get('1');
  await assert.rejects(api.update('1', { status: 'closed', assigneeId: 'max' }),
    (error: unknown) => error instanceof ApiError && error.status === 422 && Boolean(error.fieldErrors.assigneeId));
  assert.deepEqual(await api.get('1'), original);
  await api.update('1', { status: 'active', assigneeId: 'olga' });
  const page = await api.list({ ...emptyFilters, status: 'new' });
  assert.equal(page.total, 27);
  assert.ok(!page.items.some((ticket) => ticket.id === '1'));
  assert.equal((await api.get('1')).assigneeId, 'olga');
});

test('search, transient errors and cancellation follow the contract', async () => {
  const api = createApi(0);
  const page = await api.list({ ...emptyFilters, q: '  ДОГОВОР ', assigneeId: 'anna' });
  assert.ok(page.total > 0);
  assert.ok(page.items.every((ticket) => ticket.title.includes('договор') && ticket.assigneeId === 'anna'));
  api.failNextRequest();
  await assert.rejects(api.get('1'), (error: unknown) => error instanceof ApiError && error.status === 503);
  assert.equal((await api.get('1')).id, '1');
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.list(emptyFilters, null, controller.signal), { name: 'AbortError' });
});
