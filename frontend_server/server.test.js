import request from 'supertest'
import { test, expect } from 'vitest'
import { assertEnvVar, getBooleanEnvVar } from './server.js'

// UNIT TESTS OF ENV VAR FUNCTIONS

test('assertEnvVar should return the value of the environment variable if it exists', () => {
  process.env['EXISTING_VAR'] = 'some_value';
  const result = assertEnvVar('EXISTING_VAR');
  expect(result).toBe('some_value');
});

test('assertEnvVar should throw an error if the environment variable does not exist', () => {
  expect(() => assertEnvVar('NON_EXISTING_VAR')).toThrow();
});

test('assertEnvVar should return an empty string if the value is "NULL"', () => {
  process.env['NULL_VAR'] = 'NULL';
  const result = assertEnvVar('NULL_VAR');
  expect(result).toBe('');
});

test('getBooleanEnvVar should return true if the value is "true"', () => {
  process.env['TRUE_VAR'] = 'true';
  const result = getBooleanEnvVar('TRUE_VAR');
  expect(result).toBe(true);
});

test('getBooleanEnvVar should return false if the value is "false"', () => {
  process.env['FALSE_VAR'] = 'false';
  const result = getBooleanEnvVar('FALSE_VAR');
  expect(result).toBe(false);
});

test('getBooleanEnvVar should throw an error if the value is neither "true" nor "false"', () => {
  process.env['INVALID_VAR'] = 'invalid_value';
  expect(() => getBooleanEnvVar('INVALID_VAR')).toThrow();
});

// MOCKED INTEGRATION TESTS OF SERVER (NEEDS TO BE RUNNING)

test('GET / serves the React App index.html from frontend/', async () => {
	const response = await request("http://0.0.0.0:8080").get('/').set('Authorization', 'Bearer SomeToken')
	expect(response.statusCode).toBe(200)
	expect(response.headers['content-type']).toBe('text/html; charset=UTF-8')
	expect(response.text).toContain('<meta property="og:title" content="Health Equity Tracker" />')
	expect(response.text).toContain('<script type="module" src="/src/index.tsx"></script>')
})

test('GET /api run as prod pings the data server. in this case mocked to return json from mocky.io', async () => {
	const response = await request("http://0.0.0.0:8080").get('/api')
	expect(response.statusCode).toBe(200)
	expect(response.headers['content-type']).toBe('text/json; charset=UTF-8')
	expect(response.text).toBe("123")
})