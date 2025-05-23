const mongoose = require("mongoose");
const Language = require("../models/languagesModel");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;

const languagesToAdd = [
  { name: "Abkhazian", code: "ab" },
  { name: "Afar", code: "aa" },
  { name: "Afrikaans", code: "af" },
  { name: "Albanian", code: "sq" },
  { name: "Amharic", code: "am" },
  { name: "Arabic", code: "ar" },
  { name: "Armenian", code: "hy" },
  { name: "Assamese", code: "as" },
  { name: "Aymara", code: "ay" },
  { name: "Azerbaijani", code: "az" },
  { name: "Bashkir", code: "ba" },
  { name: "Basque", code: "eu" },
  { name: "Belarusian", code: "be" },
  { name: "Bengali", code: "bn" },
  { name: "Bhojpuri", code: "bho" },
  { name: "Bosnian", code: "bs" },
  { name: "Bulgarian", code: "bg" },
  { name: "Burmese", code: "my" },
  { name: "Catalan", code: "ca" },
  { name: "Cebuano", code: "ceb" },
  { name: "Chinese", code: "zh" },
  { name: "Corsican", code: "co" },
  { name: "Croatian", code: "hr" },
  { name: "Czech", code: "cs" },
  { name: "Danish", code: "da" },
  { name: "Dhivehi", code: "dv" },
  { name: "Dutch", code: "nl" },
  { name: "English", code: "en" },
  { name: "Esperanto", code: "eo" },
  { name: "Estonian", code: "et" },
  { name: "Finnish", code: "fi" },
  { name: "French", code: "fr" },
  { name: "Georgian", code: "ka" },
  { name: "German", code: "de" },
  { name: "Greek", code: "el" },
  { name: "Gujarati", code: "gu" },
  { name: "Haitian Creole", code: "ht" },
  { name: "Hausa", code: "ha" },
  { name: "Hawaiian", code: "haw" },
  { name: "Hebrew", code: "he" },
  { name: "Hindi", code: "hi" },
  { name: "Hmong", code: "hmn" },
  { name: "Hungarian", code: "hu" },
  { name: "Icelandic", code: "is" },
  { name: "Igbo", code: "ig" },
  { name: "Indonesian", code: "id" },
  { name: "Irish", code: "ga" },
  { name: "Italian", code: "it" },
  { name: "Japanese", code: "ja" },
  { name: "Javanese", code: "jv" },
  { name: "Kannada", code: "kn" },
  { name: "Kazakh", code: "kk" },
  { name: "Khmer", code: "km" },
  { name: "Kinyarwanda", code: "rw" },
  { name: "Korean", code: "ko" },
  { name: "Kurdish", code: "ku" },
  { name: "Kyrgyz", code: "ky" },
  { name: "Lao", code: "lo" },
  { name: "Latin", code: "la" },
  { name: "Latvian", code: "lv" },
  { name: "Lithuanian", code: "lt" },
  { name: "Luxembourgish", code: "lb" },
  { name: "Macedonian", code: "mk" },
  { name: "Malagasy", code: "mg" },
  { name: "Malay", code: "ms" },
  { name: "Malayalam", code: "ml" },
  { name: "Maltese", code: "mt" },
  { name: "Maori", code: "mi" },
  { name: "Marathi", code: "mr" },
  { name: "Mongolian", code: "mn" },
  { name: "Nepali", code: "ne" },
  { name: "Norwegian", code: "no" },
  { name: "Nyanja", code: "ny" },
  { name: "Odia", code: "or" },
  { name: "Pashto", code: "ps" },
  { name: "Persian", code: "fa" },
  { name: "Polish", code: "pl" },
  { name: "Portuguese", code: "pt" },
  { name: "Punjabi", code: "pa" },
  { name: "Romanian", code: "ro" },
  { name: "Russian", code: "ru" },
  { name: "Serbian", code: "sr" },
  { name: "Sesotho", code: "st" },
  { name: "Shona", code: "sn" },
  { name: "Sindhi", code: "sd" },
  { name: "Sinhala", code: "si" },
  { name: "Slovak", code: "sk" },
  { name: "Slovenian", code: "sl" },
  { name: "Somali", code: "so" },
  { name: "Spanish", code: "es" },
  { name: "Sundanese", code: "su" },
  { name: "Swahili", code: "sw" },
  { name: "Swedish", code: "sv" },
  { name: "Tagalog", code: "tl" },
  { name: "Tajik", code: "tg" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Thai", code: "th" },
  { name: "Turkish", code: "tr" },
  { name: "Ukrainian", code: "uk" },
  { name: "Urdu", code: "ur" },
  { name: "Uyghur", code: "ug" },
  { name: "Uzbek", code: "uz" },
  { name: "Vietnamese", code: "vi" },
  { name: "Welsh", code: "cy" },
  { name: "Xhosa", code: "xh" },
  { name: "Yiddish", code: "yi" },
  { name: "Yoruba", code: "yo" },
  { name: "Zulu", code: "zu" },
];

// Conect to MongoDB Atlas
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to the database");

    // Remove existing languages to avoid duplicates
    await Language.deleteMany();

    // Add languages to the database
    await Language.insertMany(languagesToAdd);

    console.log(`${languagesToAdd.length} languages added successfully`);

    // Close the database connection
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
    mongoose.connection.close();
  });
