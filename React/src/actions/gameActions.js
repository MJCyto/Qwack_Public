import { getGame, getIsLeader } from "../selectors/gameSelectors";
import { auth } from "../conf/firebase";

export const GameActionTypes = Object.freeze({
  SET_GAME_CODE: "SET_GAME_CODE",
  SET_IS_LEADER: "SET_IS_LEADER",
  SET_GAME: "SET_GAME",
  SET_CHOSEN_WORDS: "SET_CHOSEN_WORDS",
});

export const setGameCode = gameCode => (dispatch, getState) => {
  dispatch({
    type: GameActionTypes.SET_GAME_CODE,
    gameCode,
  });
};

export const updateGame = game => (dispatch, getState) => {
  // const state = getState();
  // const oldGameData = getGame(state);
  // if (oldGameData === game){
  //   return
  // }
  dispatch({
    type: GameActionTypes.SET_GAME,
    game: game,
  });
};

export const setChosenWords = words => dispatch => {
  dispatch({
    type: GameActionTypes.SET_CHOSEN_WORDS,
    chosenWords: words,
  });
};
