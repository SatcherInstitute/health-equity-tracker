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

// TODO: figure out better way to test the /api endpoint