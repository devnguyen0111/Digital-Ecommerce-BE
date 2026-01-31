const i18n = require("i18n");
const path = require("path");

i18n.configure({
  locales: (process.env.SUPPORTED_LANGUAGES || "en,vi").split(","),
  defaultLocale: process.env.DEFAULT_LANGUAGE || "en",
  directory: path.join(__dirname, "../../locales"),
  autoReload: true,
  syncFiles: true,
  cookie: "language",
  queryParameter: "lang",
  header: "accept-language",
  objectNotation: true,
  updateFiles: false,
  api: {
    __: "t",
    __n: "tn",
  },
});

module.exports = i18n;
