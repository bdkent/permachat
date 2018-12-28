import Logger from "js-logger";
Logger.useDefaults();

if (!!process && process.env.NODE_ENV == "production") {
  Logger.setLevel(Logger.OFF);
} else {
  Logger.setLevel(Logger.DEBUG);
}
