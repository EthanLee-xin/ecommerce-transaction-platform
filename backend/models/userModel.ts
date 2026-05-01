import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'customer',
      enum: ['customer', 'operator', 'warehouse', 'finance', 'admin'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('isAdmin').get(function (this: { role: string }) {
  return this.role === 'admin';
});

userSchema.methods.matchPassword = async function (this: { password: string }, enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (this: { isModified: (field: string) => boolean; password: string }, next: (err?: Error) => void) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
