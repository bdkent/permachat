import _ from "lodash";
import React from "react";

import { Breadcrumb, BreadcrumbItem } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract, faSlidersH } from "@fortawesome/free-solid-svg-icons";

import localForage from "localforage";

import WorkerButton from "../widgets/WorkerButton";
import EthereumContract from "../widgets/EthereumContract";

const SettingsPage = ({ contracts }) => {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem active>Settings</BreadcrumbItem>
      </Breadcrumb>
      <div>
        <h2>
          <FontAwesomeIcon className="mr-2" icon={faFileContract} /> Smart
          Contracts
        </h2>
        {_.map(contracts, ({ definition, instance }) => {
          return (
            <dl key={definition.contractName}>
              <dt>{definition.contractName}</dt>
              <dd>
                <EthereumContract address={instance.address} />
              </dd>
            </dl>
          );
        })}
        <h2>
          {" "}
          <FontAwesomeIcon className="mr-2" icon={faSlidersH} />
          Actions
        </h2>
        <WorkerButton
          color="danger"
          block={true}
          onClick={() => localForage.clear()}
        >
          Clear All Caches
        </WorkerButton>
      </div>
    </div>
  );
};

export default SettingsPage;
