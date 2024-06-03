const httpStatus = {
  // Successful responses (200–299)
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client error responses (400–499)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  // Server error responses (500–599)
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

module.exports = { httpStatus };
