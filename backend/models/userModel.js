const mongoose = require("mongoose");
const validator = require("validator");
const {
  hashPassword,
  encryptData,
  decryptData, // Added for decryption if needed
  validatePhoneNumber,
  getPhoneFinal,
  getCountryPrefix,
  validateLanguages,
  calculateAge,
} = require("../handlers/handler");

const Schema = mongoose.Schema;
const sexEnum = ["male", "female", "other"];
const roleEnum = ["client", "worker", "admin"];
const proficienciesEnum = ["beginner", "intermediate", "advanced", "native"];
const servicesEnum = []; // Services enumeration (to be defined)

// Language proficiency schema for languages field
const languageProficiencySchema = new Schema(
  {
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    proficiency: {
      type: String,
      enum: proficienciesEnum,
      default: "beginner",
    },
  },
  { _id: false }
);

// Main user schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phonePrefix: {
    type: String,
    required: function () {
      return this.phoneNumber != null;
    },
    validate: {
      validator: function (v) {
        return validatePhoneNumber(v, this.phoneNumber); // Validate phone number prefix
      },
      message: "Invalid phone prefix",
    },
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return validatePhoneNumber(this.phonePrefix, v); // Validate phone number
      },
      message: "Invalid phone number",
    },
  },
  phoneFinal: {
    type: String,
    required: false, // This will now be stored in the database (combined phone)
  },
  countryPrefix: {
    type: String,
    required: function () {
      return this.phonePrefix && this.phoneNumber;
    },
    default: function () {
      return getCountryPrefix(this.phonePrefix, this.phoneNumber); // Get country prefix based on phone number
    },
  },
  serviceRate: {
    type: String,
    default: 0,
  },
  rank: {
    type: String,
    default: 0,
  },
  sex: {
    type: String,
    enum: sexEnum,
    required: true,
  },
  birthDate: {
    day: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: String, required: true },
  },
  age: { type: String, required: false }, // Age will be calculated
  serviceSpecialist: {
    type: String,
    enum: servicesEnum, // Services that the user specializes in
  },
  role: {
    type: String,
    enum: roleEnum,
    default: "client", // Default role is 'client'
  },
  createdAt: { type: Date, default: Date.now },
  languages: [languageProficiencySchema], // Array of languages with proficiency levels
});

// Pre-save hook to calculate and store phoneFinal, hash password, encrypt phone number, and calculate age
userSchema.pre("save", async function (next) {
  console.log("Pre-save hook triggered");

  // Calculate phoneFinal if phonePrefix and phoneNumber are present
  if (this.phonePrefix && this.phoneNumber) {
    this.phoneFinal = getPhoneFinal(this.phonePrefix, this.phoneNumber);
    console.log("phoneFinal calculated:", this.phoneFinal);
  }
  // Calculate age if birthDate is modified or new
  if (this.isModified("birthDate") || this.isNew) {
    this.age = calculateAge(this.birthDate);
    console.log("Age calculated:", this.age);
  }
  // Crypto operations
  if (this.isModified("phoneNumber") || this.isNew) {
    console.log("Encrypting phone number...");
    const encryptedPhone = encryptData(this.phoneNumber);
    this.encryptedPhoneNumber = encryptedPhone.encryptedData;
    this.phoneNumber = encryptedPhone.encryptedData;
    console.log("Encrypted phone number:", this.encryptedPhoneNumber);
    console.log("Phone number:", this.phoneNumber);
  }
  if (this.isModified("phonePrefix") || this.isNew) {
    console.log("Encrypting phone prefix...");
    const encryptedPrefix = encryptData(this.phonePrefix);
    this.encryptedPhonePrefix = encryptedPrefix.encryptedData;
    this.phonePrefix = encryptedPrefix.encryptedData;
    console.log("Encrypted phone prefix:", this.encryptedPhonePrefix);
    console.log("Phone prefix:", this.PhonePrefix);
  }
  if (this.isModified("phoneFinal") || this.isNew) {
    console.log("Encrypting phone final...");
    const encryptedPhoneFinal = encryptData(this.phoneFinal);
    this.encryptedPhoneFinal = encryptedPhoneFinal.encryptedData;
    this.phoneFinal = encryptedPhoneFinal.encryptedData;
    console.log("Encrypted phone final:", this.encryptedPhoneFinal);
    console.log("Phone final:", this.phoneFinal);
  }
  if (this.isModified("email") || this.isNew) {
    console.log("Encrypting email...");
    const encryptedEmail = encryptData(this.email);
    this.encryptedEmail = encryptedEmail.encryptedData;
    this.email = encryptedEmail.encryptedData;
    console.log("Encrypted email:", this.encryptedEmail);
    console.log("Email:", this.email);
  }
  if (this.isModified("firstName") || this.isNew) {
    console.log("Encrypting first name...");
    const encryptedFirstName = encryptData(this.firstName);
    this.encryptedFirstName = encryptedFirstName.encryptedData;
    this.firstName = encryptedFirstName.encryptedData;
    console.log("Encrypted first name:", this.encryptedFirstName);
    console.log("First name:", this.firstName);
  }
  if (this.isModified("lastName") || this.isNew) {
    console.log("Encrypting last name...");
    const encryptedLastName = encryptData(this.lastName);
    this.encryptedLastName = encryptedLastName.encryptedData;
    this.lastName = encryptedLastName.encryptedData;
    console.log("Encrypted last name:", this.encryptedLastName);
    console.log("Last name:", this.lastName);
  }
  if (this.isModified("sex") || this.isNew) {
    console.log("Encrypting sex...");
    const encryptedSex = encryptData(this.sex);
    this.encryptedSex = encryptedSex.encrypted;
    this.sex = encryptedSex.encryptedData;
    console.log("Encrypted sex:", this.encryptedSex);
    console.log("sex:", this.sex);
  }
  if (this.isModified("role") || this.isNew) {
    console.log("Encrypting role...");
    const encryptedRole = encryptData(this.role);
    this.encryptedRole = encryptedRole.encryptedData;
    this.role = encryptedRole.encryptedData;
    console.log("Encrypted role:", this.encryptedRole);
    console.log("Role:", this.role);
  }
  // if (this.isModified("serviceSpecialist") || this.isNew) {
  //   console.log("Encrypting service specialist...");
  //   const encryptedServiceSpecialist = encryptData(this.serviceSpecialist);
  //   this.encryptedServiceSpecialist = encryptedServiceSpecialist.encryptedData;
  //   this.serviceSpecialist = encryptedServiceSpecialist.encryptedData;
  //   console.log(
  //     "Encrypted service specialist:",
  //     this.encryptedServiceSpecialist
  //   );
  //   console.log("Service specialist:", this.serviceSpecialist);
  // }

  if (this.isModified("birthDate.day") || this.isNew) {
    console.log("Encrypting birth date day...");
    const encryptedBirthDateDay = encryptData(this.birthDate.day);
    this.encryptedBirthDateDay = encryptedBirthDateDay.encryptedData;
    this.birthDate.day = encryptedBirthDateDay.encryptedData;
    console.log("Encrypted birth date day:", this.encryptedBirthDateDay);
    console.log("Birth date day:", this.birthDate.day);
  }
  if (this.isModified("birthDate.month") || this.isNew) {
    console.log("Encrypting birth date month...");
    const encryptedBirthDateMonth = encryptData(this.birthDate.month);
    this.encryptedBirthDateMonth = encryptedBirthDateMonth.encryptedData;
    this.birthDate.month = encryptedBirthDateMonth.encryptedData;
    console.log("Encrypted birth date month:", this.encryptedBirthDateMonth);
    console.log("Birth date month:", this.birthDate.month);
  }
  if (this.isModified("birthDate.year") || this.isNew) {
    console.log("Encrypting birth date year...");
    const encryptedBirthDateYear = encryptData(this.birthDate.year);
    this.encryptedBirthDateYear = encryptedBirthDateYear.encryptedData;
    this.birthDate.year = encryptedBirthDateYear.encryptedData;
    console.log("Encrypted birth date year:", this.encryptedBirthDateYear);
    console.log("Birth date year:", this.birthDate.year);
  }
  if (this.isModified("age") || this.isNew) {
    console.log("Encrypting age...");
    const encryptedAge = encryptData(this.age);
    this.encryptedAge = encryptedAge.encryptedData;
    this.age = encryptedAge.encryptedData;
    console.log("Encrypted age:", this.encryptedAge);
    console.log("Age:", this.age);
  }
  if (this.isModified("serviceRate") || this.isNew) {
    console.log("Encrypting service rate...");
    const encryptedServiceRate = encryptData(this.serviceRate);
    this.encryptedServiceRate = encryptedServiceRate.encryptedData;
    this.serviceRate = encryptedServiceRate.encryptedData;
    console.log("Encrypted service rate:", this.encryptedServiceRate);
    console.log("Service rate:", this.serviceRate);
  }
  if (this.isModified("rank") || this.isNew) {
    console.log("Encrypting rank...");
    const encryptedRank = encryptData(this.rank);
    this.encryptedRank = encryptedRank.encryptedData;
    this.rank = encryptedRank.encryptedData;
    console.log("Encrypted rank:", this.encryptedRank);
    console.log("Rank:", this.rank);
  }
  if (this.isModified("languages") || this.isNew) {
    console.log("Encrypting languages...");
    this.languages.forEach((lang, index) => {
      if (lang.proficiency) {
        const encryptedProficiency = encryptData(lang.proficiency);
        this.languages[index].encryptedProficiency =
          encryptedProficiency.encryptedData;
        this.languages[index].proficiency = encryptedProficiency.encryptedData;
        console.log(
          `Encrypted proficiency for language ${lang.language}:`,
          encryptedProficiency.encryptedData
        );
      }
    });
    console.log("Languages array with encrypted proficiency:", this.languages);
  }

  if (this.isModified("username") || this.isNew) {
    console.log("Encrypting username...");
    const encryptedUsername = encryptData(this.username);
    this.encryptedUsername = encryptedUsername.encryptedData;
    this.username = encryptedUsername.encryptedData;
    console.log("Encrypted username:", this.encryptedUsername);
    console.log("Username:", this.username);
  }

  // Hash password if modified or new
  if (this.isModified("password") || this.isNew) {
    console.log("Hashing password...");
    try {
      const hashedPassword = await hashPassword(this.password);
      this.password = hashedPassword;
      console.log("Hashed password:", this.password);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    console.log(ret);
    return {
      id: ret._id,
      username: ret.username,
      email: ret.email,
      password: ret.password,
      firstName: ret.firstName,
      lastName: ret.lastName,
      birthDate: ret.birthDate,
      age: ret.age,
      phonePrefix: ret.phonePrefix,
      phoneNumber: ret.phoneNumber,
      phoneFinal: ret.phoneFinal,
      countryPrefix: ret.countryPrefix,
      role: ret.role,
      serviceRate: ret.serviceRate,
      rank: ret.rank,
      sex: ret.sex,
      serviceSpecialist: ret.serviceSpecialist,
      createdAt: ret.createdAt,
      languages: ret.languages,
    };
  },
  virtuals: true,
});

userSchema
  .path("languages")
  .validate(validateLanguages, "One or more languages are invalid");

const User = mongoose.model("User", userSchema);

module.exports = User;
