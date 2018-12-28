import Logger from "js-logger";

const toLevel = level => {
  switch (level) {
    case "trace":
      return Logger.TRACE;
    case "debug":
      return Logger.DEBUG;
    case "info":
      return Logger.INFO;
    case "warn":
      return Logger.WARN;
    case "error":
      return Logger.ERROR;
    default:
      throw new Error("unexpected level: " + level);
  }
};

const LogUtils = {
  setLowest: (logger, levelStr) => {
    const level = toLevel(levelStr);
    if (logger.getLevel().value < level.value) {
      logger.setLevel(level);
    }
  }
};

export default LogUtils;
