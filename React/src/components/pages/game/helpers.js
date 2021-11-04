import styled from "styled-components";
import { auth } from "../../../conf/firebase";

export const MessageBlock = styled.Text`
  color: white;
  text-align: center;
  font-size: 15px;
`;

export const TeamBlock = styled.Text``;

export const getLeaderStatusMessage = (team, game) => {
  switch (game.gameState) {
    case team + "Leader": {
      return "It's your turn, give your normies a hint and number of words for that hint.";
    }
    case team + "Normies": {
      return "Your teammates are choosing words now...";
    }
    case team + "Won": {
      return "Your team won!";
    }
  }
  if (game.gameState.includes("Won")) {
    return "Your team lost";
  }
  return "It's the other team's turn.";
};

export const getNormieStatusMessage = (team, game) => {
  switch (game.gameState) {
    case team + "Leader": {
      return "Your leader is thinking of a hint...";
    }
    case team + "Normies": {
      if (game.availableGuesses > 1) {
        return `Its your turn, choose ${Number(game.availableGuesses) - 1} ${
          game.availableGuesses === 2 ? `word` : `words`
        } that match the hint: ${game.hint}`;
      }
      return "You have an extra guess (optional)";
    }
    case team + "Won": {
      return "Your team won!";
    }
  }
  if (game.gameState.includes("Won")) {
    return "Your team lost";
  }
  return "It's the other team's turn.";
};

export const whichTeamAmI = game => {
  let team;
  Object.keys(game.teams).map(teamName => {
    const foundPlayer = game.teams[teamName].find(player => player.uid === auth.currentUser.uid);
    if (foundPlayer) {
      team = teamName;
    }
  });
  return team;
};
