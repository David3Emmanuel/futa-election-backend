export const codes: Record<number, string> = {
  200: 'OK: Request succeeded',
  400: 'Bad request: Invalid request / invalid input data',
  401: 'Unauthorized: Invalid API key',
  403: 'Forbidden: API key cannot be used from this origin',
  404: 'Not found: The requested resource could not be found',
  409: 'Conflict, e.g. because a resource already exists',
  429: 'API key quota, resource quota or rate limit exceeded',
  500: 'Internal server error',
}
