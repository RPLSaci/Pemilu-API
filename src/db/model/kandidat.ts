import {Schema, model, Document} from "mongoose";


interface IKandidat extends Document {
  nomerKandidat: string;
  tipe: string;
  imgUrl: string;
  deskripsi: string;
  nama: string;
  kelas: string;
  totalPemilih: number;
}

const KandidatSchema: Schema<IKandidat> = new Schema({
  nomerKandidat: {type: String, required: true},
  deskripsi: {type: String, required: true},
  nama: {type: String, required: true},
  kelas: {type: String, required: true},
  imgUrl: {type: String, required: true},
  tipe: {type: String, required: true},
  totalPemilih: {type: Number, required: false, default: 0},
});


export const Kandidat = model<IKandidat>("Pemilukandidat", KandidatSchema);
