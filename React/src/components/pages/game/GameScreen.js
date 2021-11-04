import { LoadingScreen, ScreenWrapper } from "../../common/screenComponents";
import React from "react";
import { auth } from "../../../conf/firebase";
import { View } from "react-native";
import { connect } from "react-redux";
import { getChosenWords } from "../../../selectors/gameSelectors";
import { GameActionTypes } from "../../../actions/gameActions";
import LeaderGameComponent from "./LeaderGameComponent";
import NormieGameComponent from "./NormieGameComponent";

const GameScreen = props => {
  const { chosenWords, setChosenWords, game, loading, returnToLobby, leaveGame, startGame } = props;
  const { gameCode } = props;

  const userID = auth.currentUser.uid;

  const getIsLeader = () => {
    let isLeader;
    game.teams.blue.find(player => player.uid === userID && player.isLeader)
      ? (isLeader = true)
      : null;
    game.teams.red.find(player => player.uid === userID && player.isLeader)
      ? (isLeader = true)
      : null;
    return isLeader;
  };

  const getIsHost = () => {
    return game.hostUID === auth.currentUser.uid;
  };

  const isGameInLobby = () => {
    return game.gameState === "lobby";
  };

  if (loading || !game.teams || !game.teams.blue) {
    return <LoadingScreen />;
  }

  const isLeader = getIsLeader();

  const selWords = Object.keys(game.words).filter(word => game.words[word] !== "");
  if (JSON.stringify(chosenWords) !== JSON.stringify(selWords)) {
    setChosenWords(selWords);
  }
  return (
    <ScreenWrapper>
      <View style={{ position: "absolute", width: "100%" }}>
        <LoadingScreen />
      </View>
      {isLeader ? (
        <LeaderGameComponent
          gameCode={gameCode}
          game={game}
          leaveGame={leaveGame}
          returnToLobby={returnToLobby}
          isHost={getIsHost()}
          startGame={startGame}
        />
      ) : (
        <NormieGameComponent
          gameCode={gameCode}
          game={game}
          leaveGame={leaveGame}
          returnToLobby={returnToLobby}
          startGame={startGame}
          isHost={getIsHost()}
        />
      )}
    </ScreenWrapper>
  );
};

const mapStateToProps = state => ({
  chosenWords: getChosenWords(state),
});

const mapDispatchToProps = dispatch => ({
  setChosenWords: words =>
    dispatch({
      type: GameActionTypes.SET_CHOSEN_WORDS,
      chosenWords: words,
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);
