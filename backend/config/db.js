import mongoose from 'mongoose';

export const connectDB = async () => {
    mongoose.connect("mongodb+srv://hemantpippal2006_db_user:WVO0sK5SHs0QQEQV@cluster0.ct8zv2e.mongodb.net/librarymanagement")
    .then( () => {
        console.log("mongodb connected succefuly")
    })
}