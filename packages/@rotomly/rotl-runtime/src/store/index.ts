import { configureStore } from "@reduxjs/toolkit";

import createReducers from "./reducers/index.js";

export default function () {
  return configureStore({ reducer: createReducers() });
}
