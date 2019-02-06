import _ from "lodash";

const active = [];

const Scheduler = {
  start(action, ms) {
    active.push(setInterval(action, ms));
  },
  startImmediate(action, ms) {
    Scheduler.start(action, ms);
    return action();
  },
  stopAll() {
    _.forEach(active, clearInterval);
    active.length = 0;
  }
};

export default Scheduler;