const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const http = require("http")
const appointmentRoutes = require("./routes/appointmentRoutes")
const userRoutes = require("./routes/userRoutes")

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/api/appointment",appointmentRoutes)
app.use("/api/user",userRoutes)


app.get("/", (req,res) => {
    res.json({
        code : 200,
        msg : 'Success',
        model : null
    })
})




// app.use(notFound);
// app.use(errorHandler); // with this we get error in more structured format.
const PORT = process.env.PORT || 5000;

const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
