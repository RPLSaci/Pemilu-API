import {Schema, model, Document} from "mongoose";


interface IUserInfo extends Document {
  username: string;
  nisn: string;
  password: string;
  kandidatMPK: string | null;
  kandidatOsis: string | null;
  kelas: string;
  WaktuPemilihan: Date | null;
}

const userInfoSchema: Schema<IUserInfo> = new Schema({
  username: {type: String, required: true, unique: true},
  nisn: {type: String, required: true, unique: true},
  password: {type: String, required: true, unique: true},
  kandidatMPK: {type: String, required: false, default: null}, // No unique constraint here
  kelas: {type: String, required: false},
  kandidatOsis: {type: String, required: false, default: null}, // No unique constraint here
  WaktuPemilihan: {type: Date, required: false, default: null}, // No unique constraint here
});


export const userInfo = model<IUserInfo>("PemiluUserInfo", userInfoSchema);
