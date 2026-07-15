import { generate } from "otp-generator";
import User from "../models/User.js";
import sendOTP from "../utilis/sendOTP.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

//registration of a student step 1 : register user and send otp

export async function registerUser(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    if (!email)
      return res.status(400).json({
        message: "Email is required",
      });

    const cleanPhone = phone ? phone.tostring().replace(/\D/g, "") : "";
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        message: "mobile number must be  exctly 10 digit",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (exitingUser.isVerified)
        return res.status(400).json({
          message: " User alredy exist",
        });
      await User.deleteOne({ email });
    }

    const otp = generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // To send otp

    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error("Error sending otp email", emailError);
      return res.status(500).json({
        message: "failed to send otp email . please try again",
      });
    }

    const hashedpassword = await bcrypt.hash(password, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const studentId = `ST-${uuidv4().slice(0, 8).toUpperCase()}`;

    const user = await User.create({
      name,
      email,
      phone: cleanPhone,
      password: hashedpassword,
      otp,
      otpExpiry,
      studentId,
    });
    res.status(201).json({
      message: "User register succesfully, otp sent to email",
      user,
    });
  } catch (Error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
}

// step 2 : verify the otp

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email) return res.status(400)({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ messsage: " user not find " });
    if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.stauts(400).json({ message: "invalid or expiry otp" });
    }

    Object.assign(user, {isVerified:true , otp: null, otpExpiry: null});
    await user.save();
     return res.status(200).json({message: "otp verified succesfull "});

  } catch(error){
    console.error("Error verfiying otp" ,error);
     res.status(500).json({message:" Error verfying otp" , error: error.message});
  }
}



// stpe = 3 complete student profile 

export async function completeProfile(req ,res) {
  try{
   const {email, department, stream, semister, year, rollNo} = req.body;
   if(!email) return res.status(400).json({message:"Email is required"});
     const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: " user not find " });
    if(!user.isVerified) return res.status(400).json({ message: "User not verfied"});

    Object.assign(user, { department, stream , semister, year, rollNo,  isProfileCompleted:true});
    await user.save();
     return res.stauts(200).json({message: "profile completed succesfully"})
     }

    catch(error){
    console.error("Error completing profile" ,error);
     res.status(500).json({message:" completing profile" , error: error.message});
  }
}

  //login as a student

  export async function loginUser(req,res){
   try{
     const {email, password} = req.body;
    if(!email || !password){
       return res.status(400).json({
        success:false,
        message: "Email and password is required"});
    }

    const user = await User.findOne({email});
    if(!user) return res.status(404).json({ success:false,message: " user not find"});
  
   if(!user.isVerified){
     return res.status(403).json({ success: false, message: "please verify the email and otp"});
   }

    if(!(await bcrypt.compare(password, user.password))){
      return res.status(400).json({success:false, message:" Invlaid credentials"});
    }

    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET,{expiresIn : "7d"});
    const { password: _,...userResponse } = user.toObject();

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });

   }
     catch(error){
    console.error("Error during login" ,error);
     res.status(500).json({success: true,message: error.message});
  }
   
  }

  //get current user profile

  export async function getProfile(req ,res) {
     
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user) return res.status(400).json({ message: "User not find"});

        res.status(200).json({success: true, user});
    } catch(error){
    console.error("Error fething user profile" ,error);
     res.status(500).json({message:" Error fething user profile" , error: error.message});
  }
}

// update user profile 

export async function updateProfile(req, res) {
  try {
    const { name, email, phone, department, stream, semester, academicYear, rollNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email.toLowerCase()) {
        if (user.role === "user") {
          return res.status(400).json({ message: "Students are not allowed to change their email address" });
        }
        if (await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } })) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = normalizedEmail;
      }
    }
    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
      }
      user.phone = cleanPhone;
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (stream) user.stream = stream;
    if (semester) user.semester = semester;
    if (academicYear) user.year = academicYear;
    if (rollNumber) user.rollNo = rollNumber;

    await user.save();
    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
}

// get all student accout (admin)

export async function getUser() {

  try {
      const users = await User.find({ role: user , isVerified: true , isProfileCompleted: true}).Select("-password");
      res.status(200).json({success: true ,users});
  } 
  
   catch (error) {
    console.error("Error fething student :", error);
    res.status(500).json({ message: "Error fething student", error: error.message });
  }
}

// for admin registration 
export async function registerAdmin(req, res) {
  try {

    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please enter all required fields"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      phone,
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    const { password: _, ...userResponse } = user.toObject();

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      user: userResponse
    });

  } 
catch (error) {
    console.error("Error registering admin:", error);

    return res.status(500).json({
      success: false,
      message: "Error registering admin",
      error: error.message
    });
  }
}