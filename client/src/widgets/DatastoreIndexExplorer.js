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

import Posts from "../widgets/Posts";
import LoadingHOC from "../hoc/LoadingHOC";
import StringUtils from "../utils/StringUtils";

const LoadingPosts = LoadingHOC(["posts"], Posts);

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

const loadListing = async ipfsPath => {
  try {
    const result = await fetch("https://ipfs.infura.io" + ipfsPath);
    if (result.ok) {
      const text = await result.text();
      const doc = new DOMParser().parseFromString(text, "text/html");
      const queryRes = doc.querySelectorAll("a");
      return _.filter(
        _.map(queryRes, a => {
          return {
            path: a.innerText,
            uri: a.pathname
          };
        }),
        x => x.path !== ".." && x.path !== "."
      );
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};

const loadContent = async ipfsPath => {
  try {
    const result = await fetch("https://ipfs.infura.io" + ipfsPath);
    if (result.ok) {
      const json = await result.json();
      return json;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};

const LevelLabels = {
  1: "year",
  2: "month",
  3: "day",
  4: "hour",
  5: "minute",
  6: "second"
};

const levelValueLabels = (level, value) => {
  switch (LevelLabels[level]) {
    case "month":
      return MONTH_NAMES[value];
    default:
      return value;
  }
};

class DatastoreIndexExplorer extends Component {
  state = {
    status: {},
    levels: [],
    level: 0,
    levelValues: {},
    data: {}
  };

  constructor(props) {
    super(props);
    this.updateLevel = this.updateLevel.bind(this);
    this.validate = this.validate.bind(this);
    this.toPath = this.toPath.bind(this);
    this.toUriFromLevel = this.toUriFromLevel.bind(this);
    this.toUriFromPath = this.toUriFromPath.bind(this);
  }

  componentDidMount = async () => {
    if (this.props.databaseHash) {
      this.validate(this.props.databaseHash, this.state.level);
    }
  };

  componentWillReceiveProps = async newProps => {
    if (
      newProps.databaseHash &&
      this.props.databaseHash !== newProps.databaseHash
    ) {
      this.validate(newProps.databaseHash, this.state.level);
    }
  };

  toPath(_level) {
    const level = _level || this.state.level;
    const levels = this.state.levels;

    return StringUtils.mkString(levels.slice(0, level), "/", "", "");
  }

  toUriFromLevel(databaseHash, level) {
    const path = this.toPath(level);
    return this.toUriFromPath(databaseHash, path);
  }

  toUriFromPath(databaseHash, path) {
    return (
      "https://ipfs.io/ipfs/" +
      databaseHash +
      "/" +
      this.props.domain +
      "/" +
      path
    );
  }

  updateLevel(level, newLevel) {
    const self = this;
    // console.log("event", event);

    self.setState(
      prevState => {
        const newLevels = prevState.levels.slice();
        newLevels[level] = newLevel;
        return {
          levels: newLevels
        };
      },
      () => self.validate(self.props.databaseHash, newLevel)
    );
  }

  async validate(databaseHash, level) {
    // console.log("validate", databaseHash, level);
    const self = this;
    const path = this.toPath(level);

    const dirUri =
      "/ipfs/" + databaseHash + "/" + this.props.domain + "/" + path;

    self.setState(prevState => {
      const nextStatus = _.assign({}, prevState.status);
      nextStatus[path] = Statuses.Pending;
      return {
        status: nextStatus
      };
    });

    const result = await loadListing(dirUri);
    // console.log("result", result);

    if (_.isNil(result)) {
      self.setState(prevState => {
        const nextStatus = _.assign({}, prevState.status);
        nextStatus[path] = Statuses.Failure;
        return {
          status: nextStatus
        };
      });
    } else {
      if (_.size(result) === 0) {
        console.warn("hmmm", "no results", path);
      } else if (_.size(result) === 1 && result[0].path === "data.json") {
        const posts = await loadContent(result[0].uri);
        if (!_.isEmpty(posts)) {
          self.setState(prevState => {
            const nextData = _.assign({}, prevState.data);
            nextData[path] = posts;
            const nextStatus = _.assign({}, prevState.status);
            nextStatus[path] = Statuses.Success;
            return {
              data: nextData,
              status: nextStatus
            };
          });
        }
      } else {
        this.setState(
          prevState => {
            const nextLevel = prevState.level + 1;

            const nextValues = _.map(
              _.filter(result, r => r.path !== "data.json"),
              r => r.path
            );

            const nextLevelValues = _.assign({}, prevState.levelValues);
            nextLevelValues[nextLevel] = nextValues;
            const nextStatus = _.assign({}, prevState.status);
            nextStatus[path] = Statuses.Success;
            return {
              level: nextLevel,
              levelValues: nextLevelValues,
              levels: prevState.levels.concat([_.max(nextValues)]),
              status: nextStatus
            };
          },
          () => self.validate(this.props.databaseHash, this.state.level)
        );
      }
    }
  }

  render() {
    const self = this;
    const postsPath = this.toPath();
    const posts = this.state.data[postsPath];
    // console.log("render", postsPath, posts);
    return (
      <div>
        {/*<p>path: {JSON.stringify(postsPath)}</p>
        <p>levels: {JSON.stringify(this.state.levels)}</p>*/}
        <Form>
          <FormGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <StatusButton
                  status={_.defaultTo(self.state.status[""], "info")}
                  test={() => self.validate(self.props.databaseHash, 0)}
                />
              </InputGroupAddon>
              <Input
                type="text"
                readOnly={true}
                value={
                  this.props.databaseHash +
                  " (" +
                  this.props.databaseIndex +
                  " / " +
                  this.props.databaseLatestIndex +
                  ")"
                }
              />
              <InputGroupAddon addonType="append">
                <Button
                  onClick={() =>
                    window.open(
                      self.toUriFromLevel(self.props.databaseHash, 0),
                      "_blank"
                    )
                  }
                >
                  DB
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
        </Form>
        <LevelsInputForm
          levelMax={this.state.level}
          toPath={self.toPath}
          status={self.state.status}
          databaseHash={self.props.databaseHash}
          validate={self.validate}
          levels={this.state.levels}
          updateLevel={self.updateLevel}
          levelValues={this.state.levelValues}
          toUriFromLevel={self.toUriFromLevel}
        />
        <LoadingPosts
          posts={posts}
          services={this.props.services}
          showThread={true}
        />
      </div>
    );
  }
}

const LevelsInputForm = props => {
  // console.log("LevelsInputForm", "render");
  const {
    levelMax,
    toPath,
    status,
    databaseHash,
    validate,
    levels,
    updateLevel,
    levelValues,
    toUriFromLevel
  } = props;

  return _.map(_.range(1, levelMax + 1), level => {
    const levelIndex = level - 1;
    const path = toPath(level);
    return (
      <LevelInputForm
        key={path}
        path={path}
        level={level}
        levelIndex={levelIndex}
        status={_.defaultTo(status[path], "info")}
        databaseHash={databaseHash}
        validate={validate}
        value={levels[levelIndex]}
        updateLevel={updateLevel}
        uri={toUriFromLevel(databaseHash, level)}
        levelValues={levelValues[level]}
      />
    );
  });
};

class LevelInputForm extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    const newLevel = event.target.value;
    this.props.updateLevel(this.props.levelIndex, newLevel);
  }

  render() {
    // console.log("LevelInputForm", "render");
    const {
      path,
      status,
      level,
      databaseHash,
      validate,
      value,
      uri,
      levelValues
    } = this.props;
    return (
      <Form>
        <FormGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <StatusButton
                status={status}
                test={() => validate(databaseHash, level)}
              />
            </InputGroupAddon>
            <Input type="select" value={value} onChange={this.onChange}>
              {_.map(levelValues, v => {
                return (
                  <option key={path + "-" + v} value={v}>
                    {levelValueLabels(level, v)}
                  </option>
                );
              })}
            </Input>
            <InputGroupAddon addonType="append">
              <Button onClick={() => window.open(uri, "_blank")}>
                {LevelLabels[level]}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </FormGroup>
      </Form>
    );
  }
}

export default DatastoreIndexExplorer;
