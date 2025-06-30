const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dbConnection = require("./config/database").connection;
const http = require("http");
const { Server } = require("socket.io");
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const propertiesRoute = require("./routes/property");
const adPackageRoute = require("./routes/propertyAdPackages");
const payment = require("./routes/payment");
const tourRoute = require("./routes/tour");
const commentRoute = require("./routes/comment");
const kycRoute = require("./routes/kyc");
const reviewRoute = require("./routes/reviews");

require("./jobs/decayPriorityLevels.js");

require("dotenv").config();

const cors = require("cors");
const { paystackWebhook } = require("./controllers/payment.js");
const { Message } = require("./schemas/Message.js");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

// Configure view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());

const allowedOrigins = [
  "https://rurblist.com",
  "http://localhost:3000",
  "https://www.rurblist.com",
  "https://website-v1-kappa.vercel.app",
];
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});
require("./socket")(io);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// Parse Paystack webhook raw body FIRST (before global parsers)
app.use(
  "/api/v1/payment-webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);
// //Socket.io should be initialized after CORS is set up
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("chat-message", (message) => {
//     console.log("Received:", message);
//     socket.broadcast.emit("chat-message", message);
//   });
//   socket.on("register", (userId) => {
//     onlineUsers.set(userId, socket.id);
//     io.emit("online-users", Array.from(onlineUsers.keys()));
//   });

//   socket.on("disconnect", () => {
//     [...onlineUsers.entries()].forEach(([uid, sid]) => {
//       if (sid === socket.id) {
//         onlineUsers.delete(uid);
//       }
//     });
//     io.emit("online-users", Array.from(onlineUsers.keys()));
//   });
//   socket.on("join-room", async (roomId) => {
//     socket.join(roomId);

//     const messages = await Message.find({ roomId })
//       .sort({ timestamp: 1 })
//       .lean();
//     socket.emit("chat-history", messages);
//   });
//   socket.on("private-message", async ({ roomId, message, sender }) => {
//     const newMsg = await Message.create({ roomId, sender, content: message });
//     socket.to(roomId).emit("private-message", {
//       message,
//       sender,
//       timestamp: newMsg.timestamp,
//     });
//   });
//   socket.on("user-typing", ({ roomId, user }) => {
//     socket.to(roomId).emit("user-typing", user);
//   });
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// express.json()(req, res, next);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  if (allowedOrigins.includes(req.headers.origin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/properties", propertiesRoute);
app.use("/api/v1/ad-package", adPackageRoute);
app.use("/api/v1/tour", tourRoute);
app.use("/api/v1/payment", payment);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/comments", commentRoute);
app.get("/api/v1/messages/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId }).sort({ timestamp: 1 }).lean();
  res.json({ success: true, messages });
});
app.use("/api/v1/kyc", kycRoute);

// Welcome route should be before the catch-all route
app.get("/", (req, res) => {
  res.render("welcome");
});

// Catch-all route should be last
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

server.listen(PORT, () => {
  dbConnection();
  console.log(`Server running at port ${PORT}`);
});
