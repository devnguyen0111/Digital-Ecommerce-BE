const i18n = require("../config/i18n");

const languageMiddleware = (req, res, next) => {
  // initialize i18n
  i18n.init(req, res);

  // set language from header, query or user preference
  let locale =
    req.query.lang ||
    req.headers["accept-language"] ||
    (req.user && req.user.preferredLanguage) ||
    process.env.DEFAULT_LANGUAGE ||
    "en";

  // Extract first language code if multiple are provided
  if (locale.includes(",")) {
    locale = locale.split(",")[0];
  }
  if (locale.includes("-")) {
    locale = locale.split("-")[0];
  }

  // Validate locale
  const supportedLocales = (process.env.SUPPORTED_LANGUAGES || "en,vi").split(
    ",",
  );
  if (!supportedLocales.includes(locale)) {
    locale = process.env.DEFAULT_LANGUAGE || "en";
  }

  i18n.setLocale(locale);
  req.locale = locale;

  next();
};

module.exports = languageMiddleware;
