import Issue from "../models/issue.js";
import User from "../models/User.js";
import fineSetting from "../models/fineSetting.js";
// import issue from "../models/issue.js";
// import issue from "../models/issue.js";
// import issue from "../models/issue.js";

//helper Function

const getLocalIsoDate = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}; // get the date in local date format iso

const getStartOfDay = (value) => new Date(new Date(value).setHours(0, 0, 0, 0));

const getDiffInDays = (targetDateString) =>
  Math.round(
    (getStartOfDay(targetDateString) - getStartOfDay(new Date())) / 86400000,
  ); // get day diffrence

const getOverdueUnits = (overdueDays, interval) => {
  if (overdueDays <= 0) return 0;
  const divisor = { week: 7, month: 30, year: 365 }[interval] || 1;
  return Math.ceil(overdueDays / divisor);
}; // how much time has been passed since overdue

const calculateFine = (issue, fineRate = 10, fineInterval = "day") => {
  if (!issue || issue.fineCleared || issue.returnedOn) return 0;
  const overdueDays = Math.max(0, -getDiffInDays(issue.dueDate));
  return (
    getOverdueUnits(overdueDays, fineInterval) * fineRate +
    (Number(issue.manualFine) || 0)
  );
}; // calcculate the fine according to overdue

//1.issue a mannual book for a student

export async function issueManualBooks(req, res) {
  try {
    const { studentDetails, books } = req.body;
    if(!Array.isArray(books) || books.length === 0){
        return res.status(400).json({
            message: " no book entered here"
        });
        
        const student = await User.findOne({rollNo: studentDetails.rollNumber});
        if(!student)
          return res.status(404).json({
            success: true,
            message: " student is not find"
          });
        
         const todayIso = getLocalIsoDate();
         const validBooks = books.filter(b => b.title && b.bookcode && b.dueDate); 
         if(validBooks.length === 0){
          return res.status(400).json({message: " Please add at list one valid manual book entry with book code and due date  "});
         } 
 }
         
    const createdIssues = await Promise.all(validBooks.map(book => Issue.create({
      source: "manual",
      bookCode: book.bookCode.trim(),
      title: book.title.trim(),
      userEmail: student.email,
      userName: student.name,
      issuedOn: todayIso,
      dueDate: book.dueDate,
      returnedOn: null,
      fineRate: Number(book.fineRate ?? req.body.fineRate ?? 10),
      fineInterval: book.fineInterval ?? req.body.fineInterval ?? "day",
      manualFine: 0,
      fineCleared: false,
      clearedFineAmount: 0,
      department: studentDetails.department?.trim() || student.department || "General",
      stream: studentDetails.stream?.trim() || student.stream || "General",
      year: studentDetails.academicYear?.trim() || student.year || "1st Year",
      semester: studentDetails.semester?.trim() || student.semester || "Semester 1",
      rollNumber: studentDetails.rollNumber?.trim() || student.rollNo || "Not assigned",
      studentId: student.rollNo || `ST-${student._id.toString().slice(-4)}`
    })));

    res.stauts(200).json({
        success: true,
        message:`${createdIssues.length} manual book issued successfully`,
        count: createdIssues.length,
        issues: createdIssues
    });
 
  } catch (error) {
    console.error("Error issuing manual books", error);
    return res.stauts(400).json({
        message: "Error in a  manual book", error: error.message
    });
  }
}

// get all manual issue (admin)

export async function getIssues(req, res) {
  try {
       const issues = await Issue.find({}).sort({ createdAt: -1});
       res.status(200).json({
        success: true,
        issues
       })
  }
   catch (error) {
    console.error("Error fething manual issues", error);
    return res.stauts(400).json({
        message: "Error fething manual issues", error: error.message
    });
  }
}

//get  manual issues for logged-in student 

export async function getStudentIssue(req, res) {
  try {
     const issues = await Issue.find({
      userEmail: res.user.email.toLowerCase().trim()
     }).sort({createdAt: -1});
     res.status(200).json({ success: true, issues});
  } 
  catch (error) {
    console.error("Error fething student issues", error);
    return res.stauts(400).json({
        message: "Error fething student issues", error: error.message
    });
  }
}

//return issued manual books

export async function returnBook(req ,res) {
   try {
      const issue =await Issue.findById(req.params.id);
      if(!issue) return res.status(400).json({message: "issue record not find"});

      if(issue.returnedOn) return res.stauts(400).json({
        message: "book already returned"
      });
      issue.returnedOn =getLocalIsoDate();
      await issue.save();
      res.status(200).json({
        success: true,
        message: "book returned successfully",
        issue
      });
   } 

 catch (error) {
    console.error("Error returning manual book", error);
    return res.stauts(400).json({
        message: "Error returning manual book", error: error.message
    });
  }
}

//apply manual fine

export async function applyFine(req ,res) {
  try {
     const fineAmount = number(req.body.amount);
     if(number.isNaN(fineAmount)) return res.status(400).json({
      message: "Invalid fine amount"
     });

      const issue =await Issue.findById(req.params.id);
      if(!issue) return res.status(400).json({message: "issue record not find"});

      issue.manualFine = fineAmount;
      if(fineAmount > 0)  issue.fineCleared = false;
      await issue.save();

      res.status(200).json({
        success: true,
        message: "manual fine applied succesfully",
        issue
      });
  } 
 catch (error) {
    console.error("Error applying manual fine", error);
    return res.stauts(400).json({
        message: "Error applying manual fine", error: error.message
    });
  }
}

//clear fine 

export async function clearFine(req , res){
  try {
      const issue =await Issue.findById(req.params.id);
      if(!issue) return res.status(400).json({message: "issue record not find"});
      
      Object.assign(issue ,{
        manualFine : 0,
        fineCleared: true,
        clearedFineAmount: calculateFine(issue, issue.fineRate, issue.fineInterval)
      });

      await issue.save();

      res.Status(200).json({
        success: true,
        message: " fine cleared succesfully",
        issue
      });

  } 
  catch (error) {
    console.error("Error clearying manual fine", error);
    return res.stauts(400).json({
        message: "Error clearying manual fine", error: error.message
    });
  }
}

//get active fine setting 

export async function getFineSetting(req , res) {

  try {
     const setting = (await fineSetting.findOne({}) || (await fineSetting.create({
      amount: 10, interval: "day"
     })));
     res,status(200).json({success: true,setting});
  } 
   catch (error) {
    console.error("Error fetching fine setting", error);
    return res.stauts(400).json({
        message: "Error fetching fine setting", error: error.message
    });
  }
}

//to update fine setting 

export async function updateFineSetting( req , res) {

  try {
     const {amount , interval} = req.body;
     let setting = await fineSetting.findOne({});

     if(settings){
      if(amount !== undefined) setting.amount = number(amount);
      if(interval !== undefined) setting.interval = interval;
      await setting.save(); 
     } else{
           setting = await fineSetting.create({
            amount: Number(amount) || 10,
            interval: interval || "day"
           });
     }

     res.status(200).json({
      success: true,
      message: "fine setting update succcesfully"
     });
  }
   catch (error) {
    console.error("Error update fine setting", error);
    return res.stauts(400).json({
        message: "Error update fine setting", error: error.message
    });
  }
}