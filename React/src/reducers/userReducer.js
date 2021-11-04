import { UserActionTypes } from "../actions/userActions";

const initialState = {
  userName: "",
};

export const userReducer = (state = initialState, action) => {
  let newState = Object.assign({}, state);

  const actions = {
    [UserActionTypes.SET_USER_NAME]: () => {
      newState.userName = action.userName;
    },
  };

  let func = actions[action.type];
  if (func !== undefined) {
    func();
  }
  return newState === state ? state : newState;
};
