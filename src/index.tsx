import * as React from "react";
import ReactDOM from "react-dom/client";

import { BalanceChecker } from "./components/balance-checker";

import "@stellar/design-system/build/styles.min.css";
import "./index.scss";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<BalanceChecker />);
