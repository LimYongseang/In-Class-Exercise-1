const express = require('express');
const path = require('path');
const fs = require('fs');
const multiparty = require('multiparty');
const hbs = require('hbs');

const app = express();
const PORT = 3000;

// ✅ Use hbs
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// ✅ Register helpers on hbs
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('section', function(name, options) {
  if (!this._sections) this._sections = {};
  this._sections[name] = options.fn(this);
  return null;
});

app.get('/', (req, res) => {
  res.render('dashboard');
});
app.get('/dashboard', (req, res) => {
  const context = {
    pageTitle: 'Dashboard',
    items: [
      {
        id: "unique_string",
        name: "Blue Wallet",
        description: "Leather wallet with student ID",
        location: "Library Hall B",
        date: "2023-10-25",
        contact: "student@univ.edu",
        imagePath: "/uploads/filename.jpg",
        status: "Lost"
      },
      {
        id: "unique_string1",
        name: "Blue Wallet",
        description: "Leather wallet with student ID",
        location: "Library Hall B",
        date: "2023-10-25",
        contact: "student@univ.edu",
        imagePath: "/uploads/filename.jpg",
        status: "Lost"
      }
    ],
  };
  res.render('dashboard', context);  // ✅ pass context here
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
