import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      match: /^[a-z0-9_]+$/
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 160,
      default: ''
    },

    location: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ''
    },

    avatar: {
      type: String,
      default: ''
    },

    coverImage: {
      type: String,
      default: ''
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    resetPasswordToken: {
      type: String,
      select: false,
      default: undefined
    },

    resetPasswordExpiresAt: {
      type: Date,
      select: false,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    bio: this.bio,
    location: this.location,
    avatar: this.avatar,
    coverImage: this.coverImage,
    followersCount: this.followers.length,
    followingCount: this.following.length,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);