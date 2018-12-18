import _ from "lodash";

import React, { Component } from "react";
import { fetch } from "whatwg-fetch";
import {
  Input,
  Form,
  FormGroup,
  InputGroup,
  Button,
  InputGroupAddon
} from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faQuestionCircle,
  faSyncAlt
} from "@fortawesome/free-solid-svg-icons";

import ipfs from "../utils/ipfs-infura";

import SaneIPFS from "../utils/SaneIPFS";

const saneIPFS = new SaneIPFS(ipfs);

const range0Based = n => {
  return [...Array(n).keys()];
};

const range1Based = n => {
  return range0Based(n).map(x => x + 1);
};

const mkString = (xs, sep, pre, post) => {
  if (_.isEmpty(xs)) {
    return "";
  } else {
    return pre + _.join(xs, sep) + post;
  }
};

const YEARS = [2018];
const MONTHS = range1Based(12);
const HOURS = range0Based(24);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const monthName = month => {
  return MONTH_NAMES[month - 1];
};

const daysInMonth = (year, month) => {
  const days = new Date(year, month, 0).getDate();
  return range1Based(days);
};

const Statuses = {
  Success: "success",
  Pending: "pending",
  Failure: "danger"
};

const StatusButtonIcon = ({ status }) => {
  switch (status) {
    case Statuses.Success: {
      return <FontAwesomeIcon icon={faCheckCircle} />;
    }
    case Statuses.Failure: {
      return <FontAwesomeIcon icon={faExclamationCircle} />;
    }
    case Statuses.Pending: {
      return <FontAwesomeIcon icon={faSyncAlt} spin />;
    }
    default: {
      return <FontAwesomeIcon icon={faQuestionCircle} />;
    }
  }
};

const StatusButton = ({ status, test, disabled }) => {
  const toColor = status => {
    switch (status) {
      case Statuses.Pending: {
        return "info";
      }
      default: {
        return status;
      }
    }
  };

  const props = {
    disabled
  };

  return (
    <Button color={toColor(status)} onClick={test} {...props}>
      <StatusButtonIcon status={status} />
    </Button>
  );
};

const ipfsUrl = key => {
  return "https://ipfs.io/ipfs/" + key;
};

class DatastoreIndexExplorer extends Component {
  domain = "all";

  state = {
    status: {},

    years: [],
    months: [],
    days: [],
    hours: [],
    // minutes: [],
    // seconds: [],

    year: null, //new Date().getFullYear(),
    month: null, //new Date().getMonth(),
    day: null, //new Date().getDate(),
    hour: null, //new Date().getHours(),
    page: null, //0,
    pages: {}
  };

  constructor(props) {
    super(props);

    this.testKey = this.testKey.bind(this);
    this.updateYear = this.updateYear.bind(this);
    this.updateMonth = this.updateMonth.bind(this);
    this.updateDay = this.updateDay.bind(this);
    this.updateHour = this.updateHour.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.openKey = this.openKey.bind(this);
    this.anyKey = this.anyKey.bind(this);
    this.yearKey = this.yearKey.bind(this);
    this.monthKey = this.monthKey.bind(this);
    this.dayKey = this.dayKey.bind(this);
    this.hourKey = this.hourKey.bind(this);
    this.pageKey = this.pageKey.bind(this);
    this.setPath = this.setPath.bind(this);
  }

  componentDidMount = async () => {
    if (this.props.databaseHash) {
      // this.testAll();
      this.validate(this.props.databaseHash);
    }
  };

  componentWillReceiveProps = async newProps => {
    if (
      newProps.databaseHash &&
      this.props.databaseHash !== newProps.databaseHash
    ) {
      this.validate(newProps.databaseHash);
      // this.testAll(newProps.databaseHash);
    }
  };

  async validate(databaseHash) {
    const now = new Date();

    const comps = [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    ];

    const load = async ipfsPath => {
      try {
        const result = await fetch(
          "https://ipfs.infura.io/api/v0/ls?arg=" + ipfsPath
        );
        const json = await result.json();
        if (json.Type === "error") {
          return null;
        } else {
          return json;
        }
      } catch (e) {
        return null;
      }
    };

    mkString();

    // const xx = await fetch(
    //   "https://ipfs.infura.io/api/v0/ls?arg=/ipfs/QmZr9FmexytetuMw9RtHtTEXPVskiuTSgo7t2B5JuVoUQP/all/2018"
    // );
    // const yy = await xx.json();
    // console.log("hi", yy);

    // const x = await Promise.all(
    //   _.range(_.size(comps), -1).map(async i => {
    //     const path = comps.slice(0, i).join("/");
    //     const dirUri = "/ipfs/" + databaseHash + "/all/" + path;
    //     const fileUri = dirUri + "/data.json";
    //     console.log("x", path, fileUri);
    //     const fileResult = await load(fileUri);
    //     const dirResult = await load(dirUri);
    //     return {
    //       fileUri,
    //       dirUri,
    //       file: fileResult,
    //       dir: dirResult
    //     };
    //   })
    // );

    // console.log("hello", x);
  }

  anyKey(tokens) {
    return tokens.join("/");
  }

  yearKey(databaseHash) {
    return this.anyKey([
      this.props.databaseHash || databaseHash,
      this.domain,
      this.state.year
    ]);
  }

  monthKey(databaseHash) {
    return this.anyKey([
      this.props.databaseHash || databaseHash,
      this.domain,
      this.state.year,
      this.state.month
    ]);
  }

  dayKey(databaseHash) {
    return this.anyKey([
      this.props.databaseHash || databaseHash,
      this.domain,
      this.state.year,
      this.state.month,
      this.state.day
    ]);
  }

  hourKey(databaseHash) {
    return this.anyKey([
      this.props.databaseHash || databaseHash,
      this.domain,
      this.state.year,
      this.state.month,
      this.state.day,
      this.state.hour
    ]);
  }

  pageKey(databaseHash) {
    return this.anyKey([
      this.props.databaseHash || databaseHash,
      this.domain,
      this.state.year,
      this.state.month,
      this.state.day,
      this.state.hour,
      this.state.page
    ]);
  }

  testPassed(key) {
    return this.state.status[key] === Statuses.Success;
  }

  async testAll(databaseHash) {
    const self = this;

    const doTest = keys => {
      // console.log("doTest", keys);
      const key = keys.shift();
      // console.log("doTest", "key", key);
      return self.testKey(key).then(result => {
        switch (result) {
          case Statuses.Success:
            if (keys.length === 0) {
              return key;
            } else {
              return doTest(keys);
            }
          default:
            return key;
        }
      });
    };

    return doTest([
      this.yearKey(databaseHash),
      this.monthKey(databaseHash),
      this.dayKey(databaseHash),
      this.hourKey(databaseHash),
      this.pageKey(databaseHash)
    ]);
  }

  async setPath() {
    return this.props.setPath(this.pageKey());
  }

  async testKey(key) {
    function updateStatus(value) {
      return prevState => {
        const newStatus = Object.assign({}, prevState.status);
        newStatus[key] = value;
        return {
          status: newStatus
        };
      };
    }

    var self = this;

    self.setState(updateStatus(Statuses.Pending));

    return fetch(ipfsUrl(key))
      .then(result => {
        // console.log("testKey", key, Statuses.Success, result);
        if (result.ok) {
          self.setState(updateStatus(Statuses.Success), () => {
            const hourKey = self.hourKey();
            if (key === hourKey && !self.state.pages[hourKey]) {
              self.setState(
                prevState => {
                  const newPages = Object.assign({}, prevState.pages);
                  newPages[hourKey] = [0];
                  return {
                    pages: newPages
                  };
                },
                () => {
                  self.updatePage(0);
                }
              );
            }
          });
          return Statuses.Success;
        } else {
          self.setState(updateStatus(Statuses.Failure));
          return Statuses.Failure;
        }
      })
      .catch(error => {
        console.error("testKey", key, Statuses.Failure, error);
        self.setState(updateStatus(Statuses.Failure));
        return Statuses.Failure;
      });
  }

  updateByEventValue(update) {
    return event => {
      const value = event.target.value;
      update(value);
    };
  }

  updateYear(value) {
    const self = this;
    const year = value || this.state.year;
    this.setState(
      {
        year: year
      },
      () => self.testKey(self.yearKey())
    );
  }

  updateMonth(value) {
    const self = this;
    const month = value || this.state.month;
    this.setState(
      {
        month: month
      },
      () => self.testKey(self.monthKey())
    );
  }

  updateDay(value) {
    const self = this;
    const day = value || this.state.day;
    this.setState(
      {
        day: day
      },
      () => self.testKey(self.dayKey())
    );
  }

  updateHour(value) {
    const self = this;
    const hour = value || this.state.hour;
    this.setState(
      {
        hour: hour
      },
      () => self.testKey(self.hourKey())
    );
  }

  updatePage(value) {
    const self = this;
    const page = value || this.state.page;
    this.setState(
      {
        page: page
      },
      () => self.testKey(self.pageKey())
    );
  }

  openKey(key) {
    window.open(ipfsUrl(key), "_blank");
  }

  render() {
    const yearKey = this.yearKey();
    const monthKey = this.monthKey();
    const dayKey = this.dayKey();
    const hourKey = this.hourKey();
    const pageKey = this.pageKey();

    return (
      <div>
        <Form>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <StatusButton
                  status={this.state.status[yearKey]}
                  test={() => this.testKey(yearKey)}
                />
              </InputGroupAddon>
              <Input
                type="select"
                value={this.state.year}
                onChange={this.updateByEventValue(this.updateYear)}
              >
                {this.state.years.map(year => {
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Input>
              <InputGroupAddon addonType="append">
                <Button onClick={() => this.openKey(yearKey)}>year</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <StatusButton
                  status={this.state.status[monthKey]}
                  test={() => this.testKey(monthKey)}
                  disabled={!this.testPassed(yearKey)}
                />
              </InputGroupAddon>
              <Input
                type="select"
                value={this.state.month}
                onChange={this.updateByEventValue(this.updateMonth)}
              >
                {this.state.months.map(month => {
                  return (
                    <option key={month} value={month}>
                      {monthName(month)}
                    </option>
                  );
                })}
              </Input>
              <InputGroupAddon addonType="append">
                <Button onClick={() => this.openKey(monthKey)}>month</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <StatusButton
                  status={this.state.status[dayKey]}
                  test={() => this.testKey(dayKey)}
                  disabled={!this.testPassed(monthKey)}
                />
              </InputGroupAddon>
              <Input
                type="select"
                value={this.state.day}
                onChange={this.updateByEventValue(this.updateDay)}
              >
                {daysInMonth(this.state.year, this.state.month).map(day => {
                  return (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  );
                })}
              </Input>
              <InputGroupAddon addonType="append">
                <Button onClick={() => this.openKey(dayKey)}>day</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <StatusButton
                  status={this.state.status[hourKey]}
                  test={() => this.testKey(hourKey)}
                  disabled={!this.testPassed(dayKey)}
                />
              </InputGroupAddon>
              <Input
                type="select"
                value={this.state.hour}
                onChange={this.updateByEventValue(this.updateHour)}
              >
                {this.state.hours.map(hour => {
                  return (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  );
                })}
              </Input>
              <InputGroupAddon addonType="append">
                <Button onClick={() => this.openKey(hourKey)}>hour</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <StatusButton
                  status={this.state.status[pageKey]}
                  test={() => this.testKey(pageKey)}
                  disabled={!this.testPassed(hourKey)}
                />
              </InputGroupAddon>
              <Input
                type="select"
                value={this.state.page}
                onChange={this.updateByEventValue(this.updatePage)}
              >
                {(this.state.pages[hourKey] || []).map(page => {
                  return (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  );
                })}
              </Input>
              <InputGroupAddon addonType="append">
                <Button onClick={() => this.openKey(pageKey)}>page</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <Button
            block={true}
            disabled={!this.testPassed(dayKey)}
            onClick={this.setPath}
          >
            View
          </Button>
        </Form>
      </div>
    );
  }
}

export default DatastoreIndexExplorer;
