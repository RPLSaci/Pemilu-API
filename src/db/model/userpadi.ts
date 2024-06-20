/* eslint-disable no-invalid-this */
import mongoose, {Document, Schema} from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  password: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
});

userSchema.pre<IUser>("save", async function(next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.log(error);
  }
});

export const model = mongoose.model<IUser>("UserPadi", userSchema);

