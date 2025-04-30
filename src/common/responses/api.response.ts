export class ApiResponse {
    constructor(
      public readonly success: boolean,
      public readonly message: string,
      public readonly data?: any,
      public readonly meta?: any
    ) {}
  
    static success(data: any, message: string = 'Success', meta?: any) {
      return new ApiResponse(true, message, data, meta);
    }
  
    static error(message: string, errors?: any) {
      return new ApiResponse(false, message, undefined, errors);
    }
  }