import { GameActionTypes } from "../actions/gameActions";

const initialState = {
  gameCode: "",
  game: undefined,
  isLeader: false,
  chosenWords: [],
};

export const gameReducer = (state = initialState, action) => {
  let newState = Object.assign({}, state);

  const actions = {
    [GameActionTypes.SET_GAME_CODE]: () => {
      newState.gameCode = action.gameCode;
    },
    [GameActionTypes.SET_IS_LEADER]: () => {
      newState.isLeader = action.isLeader;
    },
    [GameActionTypes.SET_GAME]: () => {
      newState.game = action.game;
    },
    [GameActionTypes.SET_CHOSEN_WORDS]: () => {
      newState.chosenWords = action.chosenWords;
    },
  };

  let func = actions[action.type];
  if (func !== undefined) {
    func();
  }
  return newState === state ? state : newState;
};
