const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const allWords = require('./allWords.json')

const validateSender = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to do this.'
        )
    }
}

const getIsLeader = (teams, uid) => {
    let isLeader;
    teams.blue.find(player => player.uid === uid && player.isLeader)
        ? (isLeader = true)
        : null;
    teams.red.find(player => player.uid === uid && player.isLeader)
        ? (isLeader = true)
        : null;
    return isLeader;
}

function shuffle(array) {
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    for (let i = array.length; i > 0 ; i--) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * i);

        // And swap it with the current element.
        temporaryValue = array[i - 1];
        array[i - 1] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

const getNewGameCode = async() => {
    var result = '';
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (let i = 0; i < 4; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length))
    }
    const gameRef = admin.firestore().collection('games').doc(result)
    const docSnapshot = await gameRef.get();
    if (docSnapshot.exists) {
        result = await getNewGameCode()
    }
    return result
}
// exports.setUpGame = functions.https.onCall(async (data, context) => {});

// Auth / User
{
    exports.signUp = functions.auth.user().onCreate(user => {
        console.log("New user signup | " + user.email);

        return admin.firestore().collection('users').doc(user.uid).set({
            name: allWords[Math.floor(Math.random() * allWords.length)]
        })
    })

    exports.userDeleted = functions.auth.user().onDelete(user => {
        console.warn("User deleted | " + user.email);
        return admin.firestore().collection('users').doc(user.uid).delete();
    })

    exports.whatsMyName = functions.https.onCall(async (data, context) => {
        validateSender(context)

        const userRef = admin.firestore().collection("users").doc(context.auth.uid);
        const user = await userRef.get();

        return user.data().name;
    })

    exports.changeName = functions.https.onCall(async (data, context) => {
        validateSender(context)

        const userRef = admin.firestore().collection("users").doc(context.auth.uid);
        await userRef.update({name: data.name});
    })
}

// Game setup
{
    exports.setUpGame = functions.https.onCall(async (data, context) => {
        validateSender(context)

        const userID = context.auth.uid;
        const userRef = admin.firestore().collection('users').doc(context.auth.uid);
        const user = await userRef.get()

        const gameCode = await getNewGameCode();
        const gameRef = admin.firestore().collection('games').doc(gameCode);
        const game = await gameRef.get();

        await gameRef.set({
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            hostUID: userID,
            teams: {
                blue: [{
                    uid: userID,
                    name: user.data().name,
                    isLeader: true
                }],
                red: [],
                spectating: []
            },
            words: [],
            gameState: "lobby",
        })

        console.log(user.data().email + " created game " + game.id)

        return gameCode;
    })

    exports.startGame = functions.https.onCall(async (data, context) => {
        validateSender(context)
        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection("games").doc(gameCode);
        const gameDoc = await gameRef.get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Invalid game code'
            )
        }

        if (gameDoc.data().hostUID !== context.auth.uid){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You are not the host.'
            )
        }

        if (!gameDoc.data().teams.red || !gameDoc.data().teams.blue){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Each team must have a leader and a normie.'
            )
        }

        if (!(gameDoc.data().teams.red.find(player => player.isLeader) && gameDoc.data().teams.blue.find(player => player.isLeader))){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Each team must have a leader.'
            )
        }

        if (gameDoc.data().teams.blue.length < 2 || gameDoc.data().teams.red.length < 2){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'There needs to be at least 1 normie per team.'
            )
        }

        const wordsRef = admin.firestore().collection('words').doc(gameCode);
        const words = [];
        for (let i = 0; i < 25; i++) {
            let chosenWord = Math.floor(Math.random() * allWords.length);

            while (words.includes(allWords[chosenWord])) {
                chosenWord = Math.floor(Math.random() * allWords.length);
            }

            words.push(allWords[chosenWord])
        }

        const shuffledWords = words.slice()
        shuffle(shuffledWords);
        const wordsObj = {};
        shuffledWords.forEach(word => wordsObj[word] = "");

        // 0 is blue, 1 is red
        const whoseTurn = Math.floor(Math.random() * 2)
        let numOfBlueCards = 7;
        let numOfRedCards = 7;

        switch (whoseTurn) {
            case 0: {
                numOfBlueCards++;
                break;
            }
            case 1: {
                numOfRedCards++;
                break;
            }
        }

        await wordsRef.set({
            blue: words.splice(0, numOfBlueCards),
            red: words.splice(0, numOfRedCards),
            black: words.splice(0, 1),
            white: words,
        })
        await gameRef.update({
            gameState: numOfBlueCards > numOfRedCards? "blueLeader" : "redLeader",
            words: wordsObj,
            winReason: "",
        })
    })

    exports.endGame = functions.https.onCall(async (data, context) => {
        validateSender(context)
        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection("games").doc(gameCode);
        const gameDoc = await gameRef.get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Invalid game code'
            )
        }

        if (gameDoc.data().hostUID !== context.auth.uid){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Only the host can end a game.'
            )
        }

        await gameRef.update({
            gameState: "lobby",
            words: {},
            hint: "",
            availableGuesses: 0,
        })

    })

    exports.joinGame = functions.https.onCall(async (data, context) => {
        validateSender(context)

        if (!data.gameCode){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You must enter a game code to join'
            );
        }

        const userID = context.auth.uid;

        const gameCode = data.gameCode.toUpperCase()

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        const userRef = admin.firestore().collection('users').doc(context.auth.uid);
        const user = await userRef.get();


        if (!gameDoc.exists){
            console.log("User " + context.auth.uid + " tried joining non-existent game " + gameCode)
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Game with provided code doesnt exist.')
        }

        const teams = gameDoc.data().teams

        let playerFound = false;

        Object.keys(teams).forEach(teamName => {
            const player = teams[teamName].find(player => player.uid === userID);
            if (player){
                playerFound = true;
            }
        })

        if (playerFound){
            return
        }

        if (teams.blue.length > teams.red.length){
            await gameRef.update({
                'teams.red': admin.firestore.FieldValue.arrayUnion({
                    isLeader: !teams.red.find(player => player.isLeader),
                    name: user.data().name,
                    uid: userID
                })
            })
        }
        else {
            await gameRef.update({
                'teams.blue': admin.firestore.FieldValue.arrayUnion({
                    isLeader: !teams.blue.find(player => player.isLeader),
                    name: user.data().name,
                    uid: userID
                })
            })
        }
    });

    exports.makeLeader = functions.https.onCall(async (data, context) => {
        validateSender(context)
        const callerUID = context.auth.uid;
        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        if (gameDoc.data().hostUID !== callerUID){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Only the host can change leaders.'
            );
        }
        const update = gameDoc.data().teams;

        Object.keys(update).forEach(teamColor => {
            const foundPlayer = gameDoc.data().teams[teamColor].find(player => player.uid === data.uid);
            if (foundPlayer){
                update[teamColor].foreach(player => {
                    player.isLeader = player.uid === data.uid
                })
            }
        })

        await gameRef.update({teams: update})
    });

    exports.changeTeam = functions.https.onCall(async (data, context) => {
        validateSender(context)
        const callerUID = context.auth.uid;
        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        if (!(gameDoc.data().hostUID === callerUID || callerUID === data.uid)){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Only the host or the player themselves can do this.'
            );
        }

        const update = gameDoc.data().teams;


        const teamColor = Object.keys(update).find(teamColor => {
            return update[teamColor].find(player => player.uid === data.uid)
        })

        if (!(teamColor === "blue" || teamColor === "red")){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'That UID doesnt belong to a player in red or blue.'
            );
        }

        let otherTeamColor = teamColor === "blue"? "red": "blue"

        const foundPlayer = update[teamColor].find(player => player.uid === data.uid)

        if (foundPlayer.isLeader){
            const otherLeader = gameDoc.data().teams[otherTeamColor].find(player => player.isLeader)

            if (otherLeader){
                update[teamColor].push(otherLeader)
                update[otherTeamColor] = update[otherTeamColor].filter(player => player.uid !== otherLeader.uid)
            }
        }


        update[otherTeamColor].push(foundPlayer)
        update[teamColor] = update[teamColor].filter(player => player.uid !== data.uid)

        await gameRef.update({teams: update})

    });

    exports.makeLeader =functions.https.onCall(async (data, context) => {
        validateSender(context)
        const callerUID = context.auth.uid;
        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        if (gameDoc.data().hostUID !== callerUID) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Only the host or the player themselves can do this.'
            );
        }

        const update = gameDoc.data().teams;


        const teamColor = Object.keys(update).find(teamColor => {
            return update[teamColor].find(player => player.uid === data.uid)
        })

        if (!(teamColor === "blue" || teamColor === "red")){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'That UID doesnt belong to a player in red or blue.'
            );
        }

        update[teamColor].forEach((player, index) => {
            update[teamColor][index] = {name: player.name, uid: player.uid, isLeader: player.uid === data.uid}
        })

        await gameRef.update({teams: update})
    });
}

// In Game
{
    exports.getKey = functions.https.onCall(async (data, context) => {
        validateSender(context)
        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection("games").doc(gameCode);
        const game = await gameRef.get();

        const isLeader = getIsLeader(game.data().teams, context.auth.uid)

        if (isLeader){
            const key = await admin.firestore().collection("words").doc(gameCode).get()
            return key.data();
        }

        return {}
    })

    exports.giveHint = functions.https.onCall(async (data, context) => {
        validateSender(context)

        if (!data.gameCode){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You must enter a game code to join'
            );
        }

        if (!data.hint || data.hint === "" || isNaN(Number(data.numWords)) || Number(data.numWords) < 1){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You must provide a hint and number.'
            );
        }

        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        const numGuesses = Number(data.numWords) + 1;

        // Check that it is that leader's turn
        console.log(gameDoc.data().gameState)
        switch (gameDoc.data().gameState){
            case "blueLeader":{
                const player = gameDoc.data().teams.blue.find(bluePlayer => bluePlayer.uid === context.auth.uid)
                // The player is not on the blue team or they are not the leader.
                if (!player || !player.isLeader){
                    throw new functions.https.HttpsError(
                        'failed-precondition',
                        'It is either not your turn or you are not the leader.'
                    );
                }
                await gameRef.update({hint: data.hint, availableGuesses: numGuesses, gameState: "blueNormies"})
                break;
            }
            case "redLeader":{
                const player = gameDoc.data().teams.red.find(redPlayer => redPlayer.uid === context.auth.uid)
                // The player is not on the blue team or they are not the leader.
                if (!player || !player.isLeader){
                    throw new functions.https.HttpsError(
                        'failed-precondition',
                        'It is either not your turn or you are not the leader.'
                    );
                }

                await gameRef.update({hint: data.hint, availableGuesses: numGuesses, gameState: "redNormies"})
                break;
            }
            default:{
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    "You can only do that if you're the leader and it's your turn"
                );
            }
        }

        // set the game's hint to the provided one.

        // Change to make normies pick
    })

    exports.endTurn = functions.https.onCall(async (data, context) => {
        // TODO do this
        validateSender(context)
        if (!data.gameCode){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You must provide a game code'
            );
        }

        const gameCode = data.gameCode.toUpperCase()
        const gameRef = admin.firestore().collection("games").doc(gameCode);
        const game = await gameRef.get();

        // let callerTeamColor;
        //
        // Object.keys(game.data().teams).forEach(teamName => {
        //     const foundPlayer = game.data().teams[teamName].find(player => player.uid === context.auth.uid )
        // })
        const callerTeamColor = Object.keys(game.data().teams).find(teamColor => game.data().teams[teamColor].find(player => player.uid === context.auth.uid ))

        if (game.data().gameState !== callerTeamColor + "Normies"){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You must be a member of the team whose turn it currently is.'
            );
        }

        if (callerTeamColor === "blue"){
            await gameRef.update({gameState: "redLeader"})
        }
        else if (callerTeamColor === "red"){
            await gameRef.update({gameState: "blueLeader"})
        }
    })

    exports.leaveGame = functions.https.onCall(async (data, context) => {
        validateSender(context)
        const gameCode = data.gameCode;
        const userID = context.auth.uid;

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        if (gameDoc.data().hostUID === context.auth.uid){
            await gameRef.delete();
            await admin.firestore().collection('words').doc(gameCode).delete()
            return;
        }

        await gameRef.update({
            teams: {
                blue: gameDoc.data().teams.blue.filter(player => player.uid !== userID),
                red: gameDoc.data().teams.red.filter(player => player.uid !== userID),
                spectating: gameDoc.data().teams.spectating.filter(player => player.uid !== userID)
            }
        })
    })

    exports.guess = functions.https.onCall(async (data, context) => {
        validateSender(context)

        if (!data.gameCode){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'You must provide a game code'
            );
        }

        const gameCode = data.gameCode;

        const gameRef = admin.firestore().collection('games').doc(gameCode)
        const gameDoc = await gameRef.get();

        const wordsRef = admin.firestore().collection('words').doc(gameCode)
        const wordsDoc = await wordsRef.get();

        // Check that user can make guess - its their turn?
        switch (gameDoc.data().gameState){
            case "blueNormies":{
                const foundPlayer = gameDoc.data().teams.blue.find(player => player.uid === context.auth.uid);
                if (!foundPlayer || foundPlayer.isLeader){
                    throw new functions.https.HttpsError(
                        'failed-precondition',
                        'Its not your turn.'
                    );
                }
                break;
            }
            case "redNormies":{
                const foundPlayer = gameDoc.data().teams.red.find(player => player.uid === context.auth.uid);
                if (!foundPlayer || foundPlayer.isLeader){
                    throw new functions.https.HttpsError(
                        'failed-precondition',
                        'Its not your turn.'
                    );
                }
                break;
            }
            default:{
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Its not your turn.'
                );
            }
        }

        if (gameDoc.data().words[data.guess] !== ""){
            throw new functions.https.HttpsError(
                'failed-precondition',
                'That word has already been chosen.'
            );
        }
        else if (gameDoc.data().words[data.guess] === undefined){
            console.log(data.guess)
            throw new functions.https.HttpsError(
                'failed-precondition',
                'That word doesnt exist.'
            );
        }

        let wordColor;
        Object.keys(wordsDoc.data()).forEach(color => {
            const foundWord = wordsDoc.data()[color].find(word => word === data.guess);

            if (foundWord){
                wordColor = color
            }
        })
        if (!wordColor){
            throw new functions.https.HttpsError(
                'internal',
                'Word not found in key.'
            );
        }

        let playersColor;
        Object.keys(gameDoc.data().teams).forEach(teamColor => {
            let foundPlayer = gameDoc.data().teams[teamColor].find(teamPlayer => teamPlayer.uid === context.auth.uid)
            if (foundPlayer){
                playersColor = teamColor;
            }
        })

        const update = {};

        update.availableGuesses = gameDoc.data().availableGuesses - 1;

        const pickedBlueWords = Object.keys(gameDoc.data().words).filter(word => gameDoc.data().words[word] === "blue")
        const pickedRedWords = Object.keys(gameDoc.data().words).filter(word => gameDoc.data().words[word] === "red")

        // All the blue cards have been picked
        if (wordColor === "blue" && wordsDoc.data().blue.length === pickedBlueWords.length + 1){
            update.gameState = "blueWon";
            update.winReason = "All blue words have been picked."
        }
        // All the red cards have been picked
        else if (wordColor === "red" && wordsDoc.data().red.length === pickedRedWords.length + 1){
            update.gameState = "redWon";
            update.winReason = "All red words have been picked."
        }
        else if (wordColor === "black"){
            switch (gameDoc.data().gameState){
                case "blueNormies":{
                    update.gameState = "redWon"
                    break
                }
                case "redNormies":{
                    update.gameState = "blueWon"
                    break
                }
            }
            update.winReason = "The death card was picked."
        }
        else if (update.availableGuesses < 1 || wordColor !== playersColor){
            switch (gameDoc.data().gameState){
                case "blueNormies":{
                    update.gameState = "redLeader"
                    break
                }
                case "redNormies":{
                    update.gameState = "blueLeader"
                    break
                }
            }
        }

        if (update.gameState === "redWon" || update.gameState === "blueWon"){
            // The game has ended so everyone should see which cards were which.
            const newWords = gameDoc.data().words

            console.log(update.gameState)
            console.log(Object.keys(wordsDoc.data()))

            // Go through all words in the wordsDoc and provide info to all words in gameDoc.
            Object.keys(wordsDoc.data()).forEach(wordsDocColor => {
                wordsDoc.data()[wordsDocColor].forEach(wordsDocWord => {
                    newWords[wordsDocWord] = wordsDocColor;
                })
            })

            update.words = newWords;
        }
        else{
            // Update the words to have the new color for the guessed word
            const newWords = gameDoc.data().words
            newWords[data.guess] = wordColor;
            update.words = newWords;
        }


        await gameRef.update(update)
    })

}

// Messaging
{
    exports.sendMessage = functions.https.onCall()
}