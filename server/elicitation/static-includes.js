var fs = require('fs');

var staticIncludes = {
  "google-analytics.html": {
    filename: "app/google-analytics.html",
    content: null
  },
  "eat.hbs": {
    filename: "app/templates/eat.hbs",
    content: null
  },
  "widgets.hbs": {
    filename: "app/templates/widgets.hbs",
    content: null
  }
};

// YUUUUUUUUCKKK!!!! THIS SO GROSS!!!! FIXME FIXME FIXME
Object.keys(staticIncludes).forEach(function (includeName) {
  fs.readFile(staticIncludes[includeName].filename, 'utf8', function (err, content) {
    staticIncludes[includeName].content = content;
  });
});

module.exports = function (filename) {
  return staticIncludes[filename].content;
};