import { createSelector } from "reselect";
import { auth } from "../conf/firebase";

export const getGameCode = state => state.gameReducer.gameCode;
export const getGame = state => state.gameReducer.game;
export const getChosenWords = state => state.gameReducer.chosenWords;

const findUserByID = (teams, uid) => {
  Object.keys(teams).forEach(teamName => {
    const foundUser = teams[teamName].filter(player => player.uid === uid);
    if (foundUser) {
      return foundUser;
    }
  });
  return undefined;
};

export const getIsLeader = createSelector([getGame], game => {
  if (game) {
    return findUserByID(game.teams, auth.currentUser.uid).isLeader;
  }
});
