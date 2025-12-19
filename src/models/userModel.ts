import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  coverPhoto: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'please enter a valid Email'],
      unique: [true, 'this Email is signed before'],
    },
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: [true, 'this username is exist, please try another one'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      select: false,
      minLength: [3, 'password must be greater than 7 characters'],
    },
    firstName: {
      type: String,
      required: [true, 'enter your first name'],
      max: 30,
    },
    lastName: {
      type: String,
      required: [true, 'enter your last name'],
      max: 30,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  return;
});
const User = mongoose.model<IUser>('User', userSchema);
export default User;
