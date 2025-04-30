export class HttpError extends Error {
    constructor(
      public readonly statusCode: number,
      message: string,
      public readonly details?: any
    ) {
      super(message);
    }
  }
  
  export class BadRequestError extends HttpError {
    constructor(message = 'Bad Request', details?: any) {
      super(400, message, details);
    }
  }
  
  export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
      super(401, message);
    }
  }
  
  export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden', details?: any) {
        super(403, message, details);
    }
}

  export class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
      super(404, message);
    }
  }
  
  export class InternalServerError extends HttpError {
    constructor(message = 'Internal Server Error') {
      super(500, message);
    }
  }