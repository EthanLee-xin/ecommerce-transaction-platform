import asyncHandler from '../middleware/asyncHandler.ts';

const authUser = asyncHandler(async (req: any, res: any) => {
  res.status(501).json({ message: 'authUser not implemented yet' });
});

const registerUser = asyncHandler(async (req: any, res: any) => {
  res.status(501).json({ message: 'registerUser not implemented yet' });
});

const logoutUser = asyncHandler(async (req: any, res: any) => {
  res.status(200).json({ message: 'logged out' });
});

const getUserProfile = asyncHandler(async (req: any, res: any) => {
  res.status(501).json({ message: 'getUserProfile not implemented yet' });
});

const updateUserProfile = asyncHandler(async (req: any, res: any) => {
  res.status(501).json({ message: 'updateUserProfile not implemented yet' });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
