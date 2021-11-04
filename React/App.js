import React from "react";
import { YellowBox } from "react-native-web";
import { DarkTheme, Provider as PaperProvider } from "react-native-paper";
import { Colors } from "./src/conf/colors";
import { applyMiddleware, createStore } from "redux";
import rootReducer from "./src/reducers/index";
import { Provider } from "react-redux";
import _ from "lodash";
import MainApp from "./src/MainApp";
import thunk from "redux-thunk";

// TODO put in for prod!
console.disableYellowBox = true;

// YellowBox.ignoreWarnings(["Setting a timer"]);
// const _console = _.clone(console);
// console.warn = message => {
//   if (message.indexOf("Setting a timer") <= -1) {
//     _console.warn(message);
//   }
//   if (message.indexOf("inside the function body of another component") <= -1) {
//     _console.warn(message);
//   }
// };

const store = createStore(rootReducer, applyMiddleware(thunk));

export default function App() {
  return (
    <>
      <Provider store={store}>
        <PaperProvider theme={theme} dark={true}>
          <MainApp />
        </PaperProvider>
      </Provider>
    </>
  );
}

const theme = {
  ...DarkTheme,
  roundness: 2,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.Emerald,
    accent: Colors.PolishedPine,
    background: Colors.CharlestonGreen,
    surface: Colors.OuterSpaceCrayola,
    red: Colors.BrickRed,
    blue: Colors.MetallicSeaweed,
    white: Colors.Snow,
    warning: Colors.Amber,
    popup: Colors.Xiketic,
  },
  dark: true,
};
