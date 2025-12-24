import mongoose, { Types } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser {
  _id: Types.ObjectId;
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
  active: boolean;
  public: 'public' | 'private';
  hometown?: string;
  currentCity?: string;
  about?: string;
  education?: {
    level: string;
    schoolName: string;
  }[];
  experience?: {
    title: string;
    company: string;
    from: Date;
    to: Date;
  }[];
  gender?: 'Male' | 'Female';
  birthday?: Date;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagtam?: string;
    linkedIn?: string;
    x?: string;
    youtube?: string;
  };
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

    active: {
      type: Boolean,
      default: true,
    },
    public: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    about: String,
    hometown: String,
    currentCity: String,
    education: [
      {
        level: String,
        schoolName: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        from: Date,
        to: Date,
      },
    ],
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    birthday: Date,
    socialLinks: {
      website: {
        type: String,
        validate: [validator.isURL, 'Invalid URL'],
        maxLength: [50, 'website url musr be less than 50 char'],
      },
      facebook: {
        type: String,
        validate: [validator.isURL, 'Invalid URL'],
        maxLength: [50, 'facebook profile url musr be less than 50 char'],
      },
      instagram: {
        type: String,
        validate: [validator.isURL, 'Invalid URL'],
        maxLength: [50, 'instagram profile url musr be less than 50 char'],
      },
      linkedIn: {
        type: String,
        validate: [validator.isURL, 'Invalid URL'],
        maxLength: [50, 'linkedIn profile url musr be less than 50 char'],
      },
      x: {
        type: String,
        validate: [validator.isURL, 'Invalid URL'],
        maxLength: [50, 'x profile url musr be less than 50 char'],
      },
      youtube: {
        type: String,
        validate: [validator.isURL, 'Invalid URL'],
        maxLength: [50, 'youtube channel url musr be less than 50 char'],
      },
    },
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
