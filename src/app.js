const express = require("express"),
  routes = require("./routes"),
  helmet = require("helmet"),
  cors = require("cors"),
  morgan = require("morgan"),
  compression = require("compression"),
  responseTime = require("response-time");

require("./database");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(responseTime());
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
} else if (process.env.NODE_ENV === "prod") {
  app.use(morgan("combined"));
}

app.use("/api/auth", routes.authRoutes);

app.get("/", (req, res) => {
  res.redirect("/api/docs");
});

module.exports = app;
