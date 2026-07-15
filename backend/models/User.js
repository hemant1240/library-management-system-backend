import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  depertment:String,
  stream: String,
  semister: String,
  year: String,
  rollNo: String,
  isProfileCompleted: {
    type : Boolean,
    default: false,
  },
 studentId: {
    type: String,
    required: function () {
        return this.role === "student";
    },
    sparse: true
},
  role: {
    type : String,
    enum : ["user" , "admin"],
    default: "user",
  },
}, {
  timestamps: true,
});


export default mongoose.model("User", userSchema);