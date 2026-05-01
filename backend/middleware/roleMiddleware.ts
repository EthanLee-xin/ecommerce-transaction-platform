const allowRoles = (...roles: string[]) => (req: any, res: any, next: any) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user context');
  }

  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized for this role');
  }

  next();
};

const allowAnyRole = (...roles: string[]) => allowRoles(...roles);

export { allowRoles, allowAnyRole };
