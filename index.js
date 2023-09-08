const express = require("express");
const app = express();
const cors = require("cors")
const path = require('path'); // configura path 

require("dotenv").config();
const PORT = process.env.PORT || 3001;

const { dbConnection } = require("./config/config");
const { handleTypeError } = require("./middlewares/errors");

app.use(express.json());
app.use(express.static("./assets"));
app.use(cors())

// Configurar el middleware para servir archivos estáticos desde la carpeta "public"
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configurar las rutas estáticas para las imágenes
app.use('/assets/images/user', express.static('/assets/images/user'));
app.use('/assets/images/post', express.static('/assets/images/post'));
app.use('/assets/images/comment', express.static('/assets/images/comment'));

dbConnection();

app.use("/posts", require("./routes/posts"));
app.use("/comments", require("./routes/comments"));
app.use("/users", require("./routes/users"));

app.use(handleTypeError);

app.listen(PORT, () => console.log("Server started on port " + PORT));

module.exports = app;
