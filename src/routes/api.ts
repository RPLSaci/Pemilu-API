import Router from "express";
import {userInfo} from "../db/model/userInfo.js";
import {Kandidat} from "../db/model/kandidat.js";
const router = Router();

router.get("/test", (req, res) =>{
  return res.status(200).json({message: "hello world"});
});

router.get("/user/getAll", async (req, res) =>{
  const user = await userInfo.find({});
  res.json({
    message: "Data received successfully",
    data: user,
  });
});

router.get("/kandidat/getAll", async (req, res) =>{
  const user = await Kandidat.find({});
  res.json({
    message: "Data received successfully",
    data: user,
  });
});

router.post("/user/Cancel", async (req, res) => {
  const {username, password} = req.body;

  console.log(username, password);
  if (!username || !password) {
    return res.status(400).json({error: "Username and password are required"});
  }

  try {
    // Find user by username
    const user = await userInfo.findOne({nisn: username});

    // If user not found or password doesn't match
    if (!user || user.password !== password) {
      return res.status(401).json({error: "Invalid username or password"});
    }

    // Check if user has made a selection
    if (!user.kandidatMPK && !user.kandidatOsis) {
      return res.status(400).json({error: "Kamu belum Memilih"});
    }

    // Reset the user's selections
    const oldKandidatMPK = user.kandidatMPK;
    const oldKandidatOSIS = user.kandidatOsis;

    user.kandidatMPK = null;
    user.kandidatOsis = null;
    user.WaktuPemilihan = null;

    // Update the candidates' total votes
    if (oldKandidatMPK) {
      const kandidatMPK = await Kandidat.findOne({nomerKandidat: oldKandidatMPK, tipe: "MPK"});
      if (kandidatMPK && kandidatMPK.totalPemilih > 0) {
        kandidatMPK.totalPemilih -= 1;
        await kandidatMPK.save();
      }
    }

    if (oldKandidatOSIS) {
      const kandidatOSIS = await Kandidat.findOne({nomerKandidat: oldKandidatOSIS, tipe: "OSIS"});
      if (kandidatOSIS && kandidatOSIS.totalPemilih > 0) {
        kandidatOSIS.totalPemilih -= 1;
        await kandidatOSIS.save();
      }
    }

    await user.save();

    return res.status(200).json({message: "Berhasil membatalkan pilihan"});
  } catch (error) {
    return res.status(500).json({error: "An error occurred while canceling selection"});
  }
});


router.post("/user/Pilih", async (req, res) => {
  const {username, password, pilihan} = req.body;

  console.log(username, password);
  if (!username || !password) {
    return res.status(400).json({error: "Username and password are required"});
  }

  try {
    // Find user by username
    const user = await userInfo.findOne({nisn: username});

    // If user not found or password doesn't match
    if (!user || user.password !== password) {
      return res.status(401).json({error: "Invalid username or password"});
    }

    if (user.kandidatMPK || user.kandidatOsis) {
      return res.status(401).json({error: "Kamu sudah Memilih"});
    }
    // If successful login
    user.kandidatMPK = pilihan.MPK;
    user.kandidatOsis = pilihan.OSIS;
    user.WaktuPemilihan = (new Date());

    const kandidatMPK = await Kandidat.findOne({nomerKandidat: pilihan.MPK, tipe: "MPK"});
    const kandidatOSIS = await Kandidat.findOne({nomerKandidat: pilihan.OSIS, tipe: "OSIS"});

    if (!kandidatMPK!.totalPemilih) {
      kandidatMPK!.totalPemilih = 0;
    }
    if (!kandidatOSIS!.totalPemilih) {
      kandidatOSIS!.totalPemilih = 0;
    }
    kandidatMPK!.totalPemilih = kandidatMPK!.totalPemilih + 1;
    kandidatOSIS!.totalPemilih = kandidatOSIS!.totalPemilih + 1;
    await kandidatMPK!.save();
    await kandidatOSIS!.save();
    await user.save();

    return res.status(200).json({message: "Berhasil memilih"});
  } catch (error) {
    return res.status(500).json({error: "An error occurred while logging in"});
  }
});

router.post("/uploadKandidat", async (req, res) => {
  const {tipe, nomorKandidat, namaKandidat, deskripsi, kelasKandidat, imageUrl} = req.body;

  // Validasi data
  if (!tipe || !nomorKandidat || !namaKandidat || !deskripsi || !kelasKandidat || !imageUrl) {
    return res.status(400).json({error: "Semua field wajib diisi"});
  }

  try {
    // Membuat kandidat baru
    const kandidatBaru = new Kandidat({
      nomerKandidat: nomorKandidat,
      tipe,
      imgUrl: imageUrl,
      deskripsi: deskripsi, // Anggap deskripsi sebagai visi, jika diperlukan bisa dipecah menjadi visi dan misi
      nama: namaKandidat,
      kelas: kelasKandidat,
    });

    // Menyimpan kandidat ke database
    await kandidatBaru.save();

    // Mengirim respons sukses
    return res.status(201).json({message: "Kandidat berhasil di-upload", kandidat: kandidatBaru});
  } catch (error) {
    console.error("Error saat menyimpan kandidat:", error);
    return res.status(500).json({error: "Terjadi kesalahan saat menyimpan kandidat"});
  }
});


router.post("/user/login", async (req, res) => {
  const {username, password} = req.body;

  console.log(username, password);
  if (!username || !password) {
    return res.status(400).json({error: "Username and password are required"});
  }

  try {
    // Find user by username
    const user = await userInfo.findOne({nisn: username});

    // If user not found or password doesn't match
    if (!user || user.password !== password) {
      return res.status(401).json({error: "Invalid username or password"});
    }

    const ret = {message: "Login successful", user, SudahMemilih: false};
    if (user.WaktuPemilihan) {
      ret.SudahMemilih = true;
    }
    // If successful login
    return res.status(200).json(ret);
  } catch (error) {
    return res.status(500).json({error: "An error occurred while logging in"});
  }
});

router.post("/submit", async (req, res) => {
  const {nama, kode} = req.body;

  // Basic validation
  if (!nama || !kode) {
    return res.status(400).json({error: "Nama and NISN are required"});
  }


  const user = new userInfo({
    username: nama,
    nisn: nama,
    password: kode,
  });

  await user.save();
  // Respond with the received data
  // let user = await userInfo.find({});
  console.log(user);
  res.json({
    message: "Data received successfully",
    data: user,
  });
});


// router.post("/migrasi", async (req, res) => {
//   const {nisn, password} = req.body;

//   // Cari user berdasarkan NISN
//   const user = await userInfo.findOne({nisn});

//   if (!user) {
//     return res.status(404).json({
//       message: "User not found",
//     });
//   }

//   // Cek apakah password lebih dari 5 karakter
//   // Ambil substring 5 karakter pertama
//   const newPassword = password;

//   console.log(user.password + " NEW:"+newPassword );
//   // Update password user di database
//   user.password = newPassword;
//   await user.save();

//   res.json({
//     message: "Password migration successful",
//     data: user,
//   });
// });


generatePassword(8);
function generatePassword(length = 12) {
  // Define the characters to be used in the password
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  // Combine all characters
  const allChars = lowercase + numbers;

  // Ensure the password is at least 8 characters long
  if (length < 8) {
    throw new Error("Password length must be at least 8 characters");
  }

  // Generate the password
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  return password;
}

// Example usage


export default router;
