import { ScreenWrapper } from "../../common/screenComponents";
import { Text, View, ScrollView } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import TeamAccordion from "./TeamAccordion";
import HintBlock from "./HintBlock";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";
import { functions } from "../../../conf/firebase";
import { getLeaderStatusMessage, MessageBlock, whichTeamAmI } from "./helpers";
import GameMenu from "./GameMenu";

const LeaderGameComponent = props => {
  const { colors } = useTheme();
  const { gameCode, game, returnToLobby, leaveGame, isHost, startGame } = props;

  const [gameKey, setGameKey] = useState();
  const [openAccordion, setOpenAccordion] = useState();
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const doError = message => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const getGameKey = () => {
    const keyRequest = functions.httpsCallable("getKey");
    keyRequest({ gameCode })
      .then(keyRes => {
        setGameKey(keyRes.data);
      })
      .catch(error => {
        console.warn(error);
      });
  };

  if (!gameKey) {
    getGameKey();
    return null;
  }

  const doHint = hintData => {
    setSubmitting(true);
    const hintRequest = functions.httpsCallable("giveHint");
    hintRequest({ gameCode, ...hintData })
      .then(() =>
        setTimeout(() => {
          setSubmitting(false);
        }, 1000)
      )
      .catch(error => {
        setSubmitting(false);
        doError(error.message);
      });
  };

  const team = whichTeamAmI(game);

  return (
    <>
      {gameKey && (
        <View style={{ height: "100%", width: "100%", backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: "row",
              paddingRight: 20,
              paddingLeft: 20,
              maxWidth: "100%",
              position: "relative",
              justifyContent: "center",
              minHeight: 80,
            }}
          >
            <MessageBlock style={{ width: "80%", alignSelf: "center" }}>
              {getLeaderStatusMessage(team, game)}
              {"\n"}
              {game.winReason}
            </MessageBlock>
            <GameMenu
              game={game}
              gameCode={gameCode}
              leaveGame={leaveGame}
              returnToLobby={returnToLobby}
              isHost={isHost}
              getGameKey={getGameKey}
              isLeader={true}
            />
          </View>
          <View
            style={{
              backgroundColor: colors[team],
              alignItems: "center",
              shadowColor: "#ffffff",
              width: "100%",
            }}
          >
            <Text style={{ color: colors.white, fontSize: 15, padding: 10 }}>
              {team.charAt(0).toUpperCase() + team.slice(1) + " Team"}
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              backgroundColor: colors.surface,
              marginBottom: 5,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <FontAwesomeIcon icon={faSkull} size={20} color={colors.white} />
            <View style={{ padding: 10, alignItems: "center" }}>
              <Text style={{ color: colors.white, fontSize: 15 }}>Insta-Death Word</Text>
              <Text style={{ color: colors.warning, fontSize: 20 }}>{gameKey.black}</Text>
            </View>

            <FontAwesomeIcon icon={faSkull} size={20} color={colors.white} />
          </View>
          <ScrollView persistentScrollbar={true} indicatorStyle={"white"}>
            <TeamAccordion
              color={colors.blue}
              items={gameKey.blue}
              title={"Blue Words"}
              expanded={openAccordion === "blue"}
              onPress={() => setOpenAccordion(openAccordion === "blue" ? "" : "blue")}
            />
            <TeamAccordion
              color={colors.red}
              items={gameKey.red}
              title={"Red Words"}
              expanded={openAccordion === "red"}
              onPress={() => setOpenAccordion(openAccordion === "red" ? "" : "red")}
            />
            <TeamAccordion
              color={colors.white}
              items={gameKey.white}
              title={"White Words"}
              expanded={openAccordion === "white"}
              onPress={() => setOpenAccordion(openAccordion === "white" ? "" : "white")}
            />
          </ScrollView>
          {/*To ensure scrollview above reveals all - hintblock is absolute.*/}
          {game.gameState === team + "Leader" && <View style={{ height: 100 }} />}
        </View>
      )}

      {game.gameState === team + "Leader" && (
        <HintBlock
          team={team}
          errorMsg={errorMessage}
          game={game}
          onSubmit={hintData => doHint(hintData)}
          isSubmitting={isSubmitting}
          buttonColor={colors.primary}
        />
      )}
    </>
  );
};

export default LeaderGameComponent;
