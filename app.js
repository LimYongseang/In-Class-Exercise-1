const express = require("express");
const path = require("path");
const fs = require("fs");
const multiparty = require("multiparty");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

// Storage store in memory
const reports = [];

// HANDLEBARS SETUP
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  }),
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));

// ENSURE UPLOADS DIRECTORY EXISTS

const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ROUTES

app.get("/", (req, res) => {
  res.redirect("/report");
});

// GET /report - show the report form
app.get("/report", (req, res) => {
  res.render("form", { title: "Report Lost Item" });
});

// POST /report - handle form submission with file upload
app.post("/report", (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) return res.redirect("/report");

    const name = fields.name ? fields.name[0] : "";
    const description = fields.description ? fields.description[0] : "";
    const location = fields.location ? fields.location[0] : "";
    const date = fields.date ? fields.date[0] : "";
    const contact = fields.contact ? fields.contact[0] : "";
    const imageFile = files.image ? files.image[0] : null;

    // Validate all fields present
    if (
      !name ||
      !description ||
      !location ||
      !date ||
      !contact ||
      !imageFile ||
      !imageFile.originalFilename
    ) {
      return res.redirect("/report");
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}_${imageFile.originalFilename}`;
    const finalFilePath = path.join(uploadsDir, fileName);

    try {
      fs.copyFileSync(imageFile.path, finalFilePath);
      fs.unlinkSync(imageFile.path);
    } catch (fsErr) {
      return res.redirect("/report");
    }

    reports.push({
      id: String(timestamp),
      name,
      description,
      location,
      date,
      contact,
      imagePath: `/uploads/${fileName}`,
      status: "Lost",
    });

    res.redirect("/dashboard");
  });
});

// GET /dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard", { title: "Dashboard", reports });
});

// Server startup
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
