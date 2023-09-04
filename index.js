const express = require("express");
const app = express();
const cors = require("cors")

require("dotenv").config();
const PORT = process.env.PORT || 3001;

const { dbConnection } = require("./config/config");
const { handleTypeError } = require("./middlewares/errors");

app.use(express.json());
app.use(express.static("./assets"));
app.use(cors())


dbConnection();

app.use("/posts", require("./routes/posts"));
app.use("/comments", require("./routes/comments"));
app.use("/users", require("./routes/users"));

app.use(handleTypeError);

app.listen(PORT, () => console.log("Server started on port " + PORT));

module.exports = app;
