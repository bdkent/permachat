import _ from "lodash";
import React from "react";

import { Alert, Button, Form, FormGroup, Col, Row } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleDoubleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faUnlockAlt
} from "@fortawesome/free-solid-svg-icons";

import IfElseHOC from "../hoc/IfElseHOC";
import ConditionalHOC from "../hoc/ConditionalHOC";
import DerivedStateHOC from "../hoc/DerivedStateHOC";

import ContractHelper from "../services/ContractHelper";

import DatastoreIndexExplorer from "./DatastoreIndexExplorer";

const ConditionalDatastoreIndexExplorer = IfElseHOC(
  "databaseIndex",
  DatastoreIndexExplorer,
  props => (
    <Alert color="warning" className="text-center">
      Database Unavailable
    </Alert>
  )
);

// there will never be a zeroth db index, so 1 is the first
const FIRST_DB_INDEX = 1;

const IsUnlockableButton = props => {
  const note = _.isNil(props.unlockableUpdates)
    ? ""
    : _.toString(props.unlockableUpdates) + " behind";
  return (
    <Button onClick={props.unlockNewestDatabase} block={true} title={note}>
      <FontAwesomeIcon className="mr-2" icon={faUnlockAlt} />
      unlock
    </Button>
  );
};

const IsAlreadyUnlockedButton = props => {
  return (
    <Button disabled={true} block={true}>
      up to date
    </Button>
  );
};

const UnlockButton = IfElseHOC(
  "isUnlockable",
  IsUnlockableButton,
  IsAlreadyUnlockedButton
);

const DataNavigator = ({
  currentDatabaseIndex,
  latestDatabaseIndex,
  paidDatabaseIndex,
  unlockableUpdates,
  goFirstDB,
  goPreviousDB,
  goNextDB,
  goLastDB,
  unlockNewestDatabase
}) => {
  const isUnlockable = !_.isNil(unlockableUpdates) && unlockableUpdates > 0;
  return (
    <Form>
      <FormGroup>
        <Row>
          <Col md={10}>
            <Row>
              <Col md={3}>
                <Button
                  disabled={currentDatabaseIndex <= FIRST_DB_INDEX}
                  onClick={goFirstDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  disabled={currentDatabaseIndex <= FIRST_DB_INDEX}
                  onClick={goPreviousDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  disabled={currentDatabaseIndex >= latestDatabaseIndex}
                  onClick={goNextDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </Button>
              </Col>
              <Col md={3}>
                <Button
                  disabled={currentDatabaseIndex === latestDatabaseIndex}
                  onClick={goLastDB}
                  block={true}
                >
                  <FontAwesomeIcon icon={faAngleDoubleRight} />
                </Button>
              </Col>
            </Row>
          </Col>
          <Col md={2}>
            <UnlockButton
              isUnlockable={isUnlockable}
              unlockableUpdates={unlockableUpdates}
              unlockNewestDatabase={unlockNewestDatabase}
            />
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

const IndexerBehindBanner = ConditionalHOC(props => {
  return (
    <Alert className="text-center">
      Indexer is {props.behind} update(s) behind.
    </Alert>
  );
});

const Datastore = DerivedStateHOC(
  class extends React.Component {
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
      this.unlockNewestDatabase = this.unlockNewestDatabase.bind(this);
    }

    componentDidMount = async () => {
      const self = this;
      const dbState = await this.props.services.getLatestDBState();
      const { latestDatabaseIndex, paidDatabaseIndex } = dbState;

      self.setState(
        {
          latestDatabaseIndex: ContractHelper.normalizeUint(
            latestDatabaseIndex
          ),
          currentDatabaseIndex: ContractHelper.normalizeUint(
            latestDatabaseIndex
          ),
          paidDatabaseIndex: ContractHelper.normalizeUint(paidDatabaseIndex)
        },
        self.updateHashMapping
      );
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

    async unlockNewestDatabase() {
      return this.props.services.unlockLatestDatabase();
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
      const behind =
        (this.state.paidDatabaseIndex || 0) -
        (this.state.latestDatabaseIndex || 0);

      return (
        <div>
          <IndexerBehindBanner behind={behind} show={behind > 0} />
          <DataNavigator
            currentDatabaseIndex={this.state.currentDatabaseIndex}
            latestDatabaseIndex={this.state.latestDatabaseIndex}
            goFirstDB={this.goFirstDB}
            goPreviousDB={this.goPreviousDB}
            goNextDB={this.goNextDB}
            goLastDB={this.goLastDB}
            unlockNewestDatabase={this.unlockNewestDatabase}
            unlockableUpdates={this.props.unlockableUpdates}
          />
          <ConditionalDatastoreIndexExplorer
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
  },
  {
    unlockableUpdates: props => props.services.unlockableUpdates()
  }
);

export default Datastore;
