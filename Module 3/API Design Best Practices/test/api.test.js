const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createApp, resetData } = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('lists posts with default pagination metadata', async () => {
  resetData();
  const response = await fetch(`${baseUrl}/posts`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.length, 2);
  assert.deepEqual(body.meta, {
    page: 1,
    limit: 2,
    total: 5,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: false,
    nextPage: 2,
    previousPage: null
  });
});

test('caps the requested list limit', async () => {
  resetData();
  const response = await fetch(`${baseUrl}/posts?limit=1000`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.length, 5);
  assert.equal(body.meta.limit, 5);
});

test('creates a post and returns the same resource envelope for likes', async () => {
  resetData();
  const createResponse = await fetch(`${baseUrl}/posts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Contract design', author: 'maya' })
  });
  const createdBody = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(createdBody.data.title, 'Contract design');

  const likeResponse = await fetch(`${baseUrl}/posts/${createdBody.data.id}/likes`, {
    method: 'POST'
  });
  const likedBody = await likeResponse.json();

  assert.equal(likeResponse.status, 200);
  assert.equal(likedBody.data.likes, 1);
});

test('returns a consistent error for missing posts', async () => {
  resetData();
  const response = await fetch(`${baseUrl}/posts/999`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: { code: 'POST_NOT_FOUND', message: 'Post was not found.' }
  });
});

test('returns a safe internal error response', async () => {
  const response = await fetch(`${baseUrl}/demo/internal-error`);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.'
    }
  });
  assert.doesNotMatch(JSON.stringify(body), /SQLITE|stack|postService/i);
});

test('does not expose the old verb routes', async () => {
  for (const route of ['/getPosts', '/getPost/1', '/createPost', '/likePost/1']) {
    const response = await fetch(`${baseUrl}${route}`, {
      method: route === '/createPost' || route === '/likePost/1' ? 'POST' : 'GET'
    });

    assert.equal(response.status, 404, `${route} should not be public`);
  }
});

test('rejects invalid pagination with a safe client error', async () => {
  const response = await fetch(`${baseUrl}/posts?page=0`);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'INVALID_PAGINATION',
      message: 'Page and limit must be positive integers.'
    }
  });
});
