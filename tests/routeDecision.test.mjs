import test from 'node:test';
import assert from 'node:assert/strict';
import { routeForRole } from '../lib/auth/routeDecision.js';

test('routeForRole returns expected routes', () => {
  assert.equal(routeForRole('admin'), '/admin');
  assert.equal(routeForRole('runner'), '/runner');
  assert.equal(routeForRole('client'), '/client');
  assert.equal(routeForRole('unknown'), '/select-role');
  assert.equal(routeForRole(null), '/select-role');
});
