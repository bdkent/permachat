import _ from "lodash";
import React from "react";
import ReactTimeout from "react-timeout";

import ConditionalHOC from "./ConditionalHOC";

const WorkerHOC = (
  property,
  WrappedComponent,
  LeftWorkingComponent,
  RightWorkingComponent
) => {
  const Left = ConditionalHOC(LeftWorkingComponent || null);
  const Right = ConditionalHOC(RightWorkingComponent || null);

  return ReactTimeout(
    class extends React.Component {
      state = {
        working: false
      };

      constructor(props) {
        super(props);

        this.startWorking = this.startWorking.bind(this);
        this.finishWorking = this.finishWorking.bind(this);
        this.doAction = this.doAction.bind(this);
      }

      componentWillReceiveProps = newProps => {
        if (newProps[property] !== this.props[property]) {
          this.init(newProps);
        }
      };

      startWorking() {
        this.setState({
          working: true
        });
      }

      finishWorking() {
        this.setState({
          working: false
        });
      }

      doAction() {
        const self = this;
        const f = this.props[property];
        if (_.isFunction(f)) {
          const timeoutId = self.props.setTimeout(self.startWorking, 250);
          const finish = () => {
            this.props.clearTimeout(timeoutId);
            self.finishWorking();
          };
          try {
            return Promise.resolve(f.apply(this, arguments))
              .then(x => {
                finish();
                return x;
              })
              .catch(error => {
                finish();
                return Promise.reject(error);
              });
          } catch (e) {
            const msg = "WorkerHOC: error processing action";
            console.error(msg, property);
            finish();
            return Promise.reject(msg);
          }
        } else {
          return f;
        }
      }

      init(props) {
        this.finishWorking();
      }

      render() {
        const props = _.omit(this.props, [
          property,
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "setImmediate",
          "clearImmediate",
          "requestAnimationFrame",
          "cancelAnimationFrame"
        ]);
        props.disabled = props.disabled || this.state.working;
        props[property] = this.doAction;
        return (
          <WrappedComponent {...props}>
            <Left show={this.state.working} />
            {props.children}
            <Right show={this.state.working} />
          </WrappedComponent>
        );
      }
    }
  );
};

export default WorkerHOC;
