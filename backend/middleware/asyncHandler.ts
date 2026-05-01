const asyncHandler = (fn: (req: any, res: any, next: any) => unknown) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
