import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAppStore } from '../../../app/store.ts';
import { ticketsApi } from './tickets-api.ts';
import { api, emptyFilters } from './mock-api.ts';

test('RTKQ caches by arguments, separates filters, and returns serializable field errors', async () => {
  api.reset();
  const store = createAppStore();
  const subscriptions: { unsubscribe(): void }[] = [];
  try {
    const first = store.dispatch(
      ticketsApi.endpoints.getTickets.initiate({ filters: emptyFilters }),
    );
    subscriptions.push(first);
    assert.equal((await first.unwrap()).total, 84);
    api.failNextRequest();
    const cached = store.dispatch(
      ticketsApi.endpoints.getTickets.initiate({ filters: { ...emptyFilters } }),
    );
    subscriptions.push(cached);
    assert.equal((await cached.unwrap()).total, 84);
    const different = store.dispatch(
      ticketsApi.endpoints.getTickets.initiate({ filters: { ...emptyFilters, status: 'active' } }),
    );
    subscriptions.push(different);
    await assert.rejects(different.unwrap(), (error: unknown) =>
      Boolean(error && typeof error === 'object' && 'status' in error && error.status === 503),
    );
    const mutation = store.dispatch(
      ticketsApi.endpoints.updateTicket.initiate({
        id: '1',
        patch: { status: 'closed', assigneeId: 'max' },
      }),
    );
    await assert.rejects(mutation.unwrap(), (error: unknown) => {
      assert.ok(error && typeof error === 'object' && 'status' in error && error.status === 422);
      assert.ok('fieldErrors' in error && typeof error.fieldErrors === 'object');
      assert.equal(Object.getPrototypeOf(error), Object.prototype);
      return true;
    });
    const updated = await store
      .dispatch(
        ticketsApi.endpoints.updateTicket.initiate({
          id: '1',
          patch: { status: 'active', assigneeId: 'olga' },
        }),
      )
      .unwrap();
    assert.equal(updated.assigneeId, 'olga');
    assert.equal((await api.get('1')).status, 'active');
  } finally {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    store.dispatch(ticketsApi.util.resetApiState());
    api.reset();
  }
});
