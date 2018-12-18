import React, { Component } from "react";

import { Button, Form, FormGroup, Col, Row } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleDoubleLeft,
  faAngleRight,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";

import DatastoreIndexExplorer from "./DatastoreIndexExplorer";

// there will never be a zeroth db index, so 1 is the first
const FIRST_DB_INDEX = 1;

class Datastore extends Component {
  state = {
    latestDatabaseIndex: null,
    currentDatabaseIndex: null,
    databaseHashMapping: {}
  };

  constructor(props) {
    super(props);

    this.updateHashMapping = this.updateHashMapping.bind(this);
    this.updateDB = this.updateDB.bind(this);
    this.goPreviousDB = this.goPreviousDB.bind(this);
    this.goNextDB = this.goNextDB.bind(this);
    this.goFirstDB = this.goFirstDB.bind(this);
    this.goLastDB = this.goLastDB.bind(this);
  }

  componentDidMount = async () => {
    const self = this;
    this.props.services.getLatestDBIndex().then(function(index) {
      self.setState(
        {
          latestDatabaseIndex: index,
          currentDatabaseIndex: index
        },
        self.updateHashMapping
      );
    });
  };

  async updateHashMapping() {
    const self = this;
    const currentDatabaseIndex = this.state.currentDatabaseIndex;
    if (
      currentDatabaseIndex &&
      !this.state.databaseHashMapping[currentDatabaseIndex]
    ) {
      this.props.services.getDB(currentDatabaseIndex).then(function(hash) {
        self.setState(prevState => {
          const newMapping = Object.assign({}, prevState.databaseHashMapping);
          newMapping[currentDatabaseIndex] = hash;
          return {
            databaseHashMapping: newMapping
          };
        });
      });
    }
  }

  async goPreviousDB() {
    return this.updateDB(this.state.currentDatabaseIndex - 1);
  }

  async goNextDB() {
    return this.updateDB(this.state.currentDatabaseIndex + 1);
  }

  async goFirstDB() {
    return this.updateDB(FIRST_DB_INDEX);
  }

  async goLastDB() {
    return this.updateDB(this.state.latestDatabaseIndex);
  }

  async updateDB(index) {
    const self = this;
    if (index >= FIRST_DB_INDEX && index <= self.state.latestDatabaseIndex) {
      self.setState(prevState => {
        return {
          currentDatabaseIndex: index
        };
      }, self.updateHashMapping);
    }
  }

  render() {
    return (
      <div>
        <Form>
          <FormGroup>
            <Row>
              <Col md={3}>
                <Button
                  disabled={this.state.currentDatabaseIndex === FIRST_DB_INDEX}
                  onClick={this.goFirstDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  disabled={this.state.currentDatabaseIndex <= FIRST_DB_INDEX}
                  onClick={this.goPreviousDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  disabled={
                    this.state.currentDatabaseIndex >=
                    this.state.latestDatabaseIndex
                  }
                  onClick={this.goNextDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  disabled={
                    this.state.currentDatabaseIndex ===
                    this.state.latestDatabaseIndex
                  }
                  onClick={this.goLastDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleDoubleRight} />
                </Button>
              </Col>
            </Row>
          </FormGroup>
        </Form>

        <DatastoreIndexExplorer
          services={this.props.services}
          databaseHash={
            this.state.databaseHashMapping[this.state.currentDatabaseIndex]
          }
          databaseIndex={this.state.currentDatabaseIndex}
          databaseLatestIndex={this.state.latestDatabaseIndex}
          domain={this.props.domain}
        />
      </div>
    );
  }
}

export default Datastore;
