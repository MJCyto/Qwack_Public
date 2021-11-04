import styled from "styled-components";
import { faEllipsisH, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { auth, functions } from "../../../conf/firebase";
import { Button } from "../../common/formComponents";
import { TouchableOpacity } from "react-native";

const Wrapper = styled.View`
  height: 50px;
  color: white;
  border-radius: 5px;
  position: relative;
  justify-content: center;
  margin: 3px 10px;
`;

const CogWrap = styled.TouchableOpacity`
  position: absolute;
  right: 5px;
  padding: 5px;
`;

const PlayerName = styled.Text`
  color: ${props => props.color};
  font-size: 17px;
  margin-left: 20px;
  margin-right: 45px;
`;

const PlayerModal = props => {
  const { colors } = useTheme();
  const { isHost, playerObj, gameCode, onClose } = props;
  const [isChangingTeam, setChangingTeam] = useState(false);
  const [isMakingLeader, setMakingLeader] = useState(false);

  const Wrapper = styled.View`
    position: absolute;
    z-index: 5;
    top: 35px;
    right: 10px;
    padding: 20px;
    background-color: ${colors.popup};
  `;

  const InnerWrap = styled.View`
    position: relative;
  `;

  const changeTeam = () => {
    setChangingTeam(true);
    const startRequest = functions.httpsCallable("changeTeam");
    // console.log("start button pressed");
    startRequest({ gameCode, uid: playerObj.uid })
      .then(() => {
        onClose();
        setTimeout(() => setMakingLeader(false), 1000);
      })
      .catch(error => {
        // doError(error.toString());
        setChangingTeam(false);
        console.log(error);
      });
  };

  const makeLeader = () => {
    setMakingLeader(true);
    const startRequest = functions.httpsCallable("makeLeader");
    startRequest({ gameCode, uid: playerObj.uid })
      .then(() => setTimeout(() => setMakingLeader(false), 1000))
      .catch(error => {
        setMakingLeader(false);
        // doError(error.toString());
        console.log(error);
      });
  };

  return (
    <Wrapper>
      <InnerWrap>
        <Button
          backgroundColor={colors.primary}
          color={colors.white}
          label={"Change Team"}
          onPress={changeTeam}
          loading={isChangingTeam}
          style={isHost && { marginBottom: 10 }}
        />
        {isHost && !playerObj.isLeader && (
          <>
            <Button
              backgroundColor={colors.primary}
              color={colors.white}
              label={"Make Leader"}
              onPress={makeLeader}
              loading={isMakingLeader}
              style={{ marginBottom: 10 }}
            />
          </>
        )}
      </InnerWrap>
    </Wrapper>
  );
};

const PlayerTile = props => {
  const { playerObj, teamColor, isHost, gameCode } = props;
  const { colors } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);

  if (!playerObj) {
    return <Wrapper />;
  }

  console.log(playerObj);
  return (
    <>
      {isModalVisible && (
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(0,0,0, 0.3)",
              position: "absolute",
              width: 10000,
              height: 10000,
              alignSelf: "center",
              zIndex: 2,
              top: -5000,
            }}
            onPress={() => setModalVisible(false)}
          />
          <PlayerModal
            playerObj={playerObj}
            isHost={isHost}
            gameCode={gameCode}
            onClose={() => setModalVisible(false)}
          />
        </View>
      )}
      <Wrapper style={{ backgroundColor: colors[teamColor], zIndex: 1, ...props.style }}>
        {/*<Modal visible={isModalVisible} onClose={() => setModalVisible(false)}>*/}
        {/*  <LobbyEditPlayerModal onClose={() => setModalVisible(false)} gameCode={gameCode} />*/}
        {/*</Modal>*/}
        <PlayerName
          color={teamColor === "white" ? colors.background : colors.white}
          numberOfLines={1}
        >
          {playerObj.name}
        </PlayerName>
        {(isHost || auth.currentUser.uid === playerObj.uid) && (
          <CogWrap onPress={() => setModalVisible(true)}>
            <FontAwesomeIcon icon={faEllipsisH} size={30} color={colors.white} />
          </CogWrap>
        )}
      </Wrapper>
    </>
  );
};

export default PlayerTile;
