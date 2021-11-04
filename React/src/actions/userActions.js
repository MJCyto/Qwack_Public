export const UserActionTypes = Object.freeze({
  SET_USER_NAME: "SET_USER_NAME",
});

export const setUserName = userName => dispatch => {
  dispatch({
    type: UserActionTypes.SET_USER_NAME,
    userName,
  });
};
