// import _ from "lodash";
import React from "react";

import { Jumbotron } from "reactstrap";

const AnonymousBlurb = () => {
  return (
    <div className="m-4">
      <Jumbotron className="text-center">
        <h1>Hello!</h1>
        <h1>
          <em>PermaChat</em>
          <span> is a </span>
          <a
            href="https://en.wikipedia.org/wiki/Blockchain"
            title="it's on the blockchain"
          >
            permanent
          </a>
          <span>, </span>
          <a href="https://en.wikipedia.org/wiki/Decentralized_application">
            decentralized
          </a>
          <span> chat app built using </span>
          <a href="https://en.wikipedia.org/wiki/Ethereum">
            <em>Web3</em>
          </a>
          <span> technology.</span>
        </h1>
      </Jumbotron>
      <Jumbotron className="text-center">
        <h2>
          Unfortunately, it's still a little tedious to enjoy these modern
          wonders.
        </h2>
        <h2>It's going to take a little work on your part.</h2>
        <h2>In order to get started, you need to follow these steps:</h2>
        <ol>
          <li>
            go install a (weird) browser extension called{" "}
            <a href="https://metamask.io/">MetaMask</a>.
          </li>
          <li>
            create a new "wallet" inside of MetaMask and add a little money to
            the account
          </li>
        </ol>
      </Jumbotron>
    </div>
  );
};

export default AnonymousBlurb;
