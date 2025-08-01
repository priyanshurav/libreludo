import type { TCoordinate, TPlayerColour } from '../../types';
import type { TToken } from '../../types';
import { TOKEN_SAFE_COORDINATES } from './constants';
import { isTokenMovable } from './logic';
import {
  isCoordASafeSpot,
  isCoordInHomeEntryPathForColour,
  isAheadInTokenPath,
  getDistanceBetweenTokens,
  getDistanceInTokenPath,
  getHomeCoordForColour,
  areCoordsEqual,
} from '../coords/logic';
import { tokenPaths } from './paths';

type TTokenCaptureInfo = { byWhichBotToken: TToken; opponentToken: TToken };

function getFinalCoord(token: TToken, diceNumber: number): TCoordinate {
  const tokenPath = tokenPaths[token.colour];
  const currentCoordIndex = tokenPath.findIndex((c) => areCoordsEqual(token.coordinates, c));
  const finalCoord = tokenPath[currentCoordIndex + diceNumber];
  return finalCoord;
}

function nearestTokenToHome(tokens: TToken[], colour: TPlayerColour): TToken | null {
  const playerHomeCoord = getHomeCoordForColour(colour);
  return tokens.reduce<TToken | null>((nearest, token) => {
    if (!nearest) return token;
    const nearestDistance = getDistanceInTokenPath(
      nearest.colour,
      nearest.coordinates,
      playerHomeCoord
    );
    const tokenDistance = getDistanceInTokenPath(
      token.colour,
      nearest.coordinates,
      playerHomeCoord
    );
    return tokenDistance < nearestDistance ? token : nearest;
  }, null);
}

function farthestTokenToHome(tokens: TToken[], colour: TPlayerColour): TToken | null {
  const playerHomeCoord = getHomeCoordForColour(colour);
  return tokens.reduce<TToken | null>((nearest, token) => {
    if (!nearest) return token;
    const nearestDistance = getDistanceInTokenPath(
      nearest.colour,
      nearest.coordinates,
      playerHomeCoord
    );
    const tokenDistance = getDistanceInTokenPath(
      token.colour,
      nearest.coordinates,
      playerHomeCoord
    );
    return tokenDistance > nearestDistance ? token : nearest;
  }, null);
}

function canTokenBeCaptured(
  botToken: TToken,
  tokenFinalCoord: TCoordinate,
  opponentTokens: TToken[]
): boolean {
  if (isCoordInHomeEntryPathForColour(tokenFinalCoord, botToken.colour)) return false;
  for (let i = 0; i < opponentTokens.length; i++) {
    const oppToken = opponentTokens[i];
    if (
      isCoordInHomeEntryPathForColour(oppToken.coordinates, oppToken.colour) ||
      isAheadInTokenPath(oppToken, { ...botToken, coordinates: tokenFinalCoord })
    )
      continue;
    const dist = getDistanceBetweenTokens({ ...botToken, coordinates: tokenFinalCoord }, oppToken);
    if (dist >= 1 && dist <= 6) return true;
  }
  return false;
}

function countNearbyActiveOpponents(
  botToken: TToken,
  tokenFinalCoord: TCoordinate,
  opponentTokens: TToken[]
): number {
  if (isCoordInHomeEntryPathForColour(tokenFinalCoord, botToken.colour)) return 0;
  let threats = 0;
  for (let i = 0; i < opponentTokens.length; i++) {
    const oppToken = opponentTokens[i];
    if (isCoordInHomeEntryPathForColour(oppToken.coordinates, oppToken.colour)) continue;
    const dist = getDistanceBetweenTokens({ ...botToken, coordinates: tokenFinalCoord }, oppToken);
    if (dist >= 1 && dist <= 6) threats++;
  }
  return threats;
}

function computeDistanceToNearestSafeSpot(botToken: TToken, tokenFinalCoord: TCoordinate): number {
  if (isCoordInHomeEntryPathForColour(tokenFinalCoord, botToken.colour)) return 0;
  const nearestSafeSpot = TOKEN_SAFE_COORDINATES.filter((c) =>
    isAheadInTokenPath({ ...botToken, coordinates: c }, botToken)
  ).reduce<TCoordinate | null>((nearest, curr) => {
    if (!nearest) return curr;
    const nearestDist = getDistanceInTokenPath(botToken.colour, tokenFinalCoord, nearest);
    const currDist = getDistanceInTokenPath(botToken.colour, tokenFinalCoord, curr);
    return nearestDist < currDist ? nearest : curr;
  }, null);

  return nearestSafeSpot
    ? getDistanceInTokenPath(botToken.colour, tokenFinalCoord, nearestSafeSpot)
    : -1;
}

export function selectBestTokenForBot(
  botPlayerColour: TPlayerColour,
  diceNumber: number,
  allTokens: TToken[]
): TToken | null {
  const botTokens = allTokens.filter((t) => t.colour === botPlayerColour);
  const movableBotTokens = botTokens.filter((t) => isTokenMovable(t, diceNumber));
  const movableOpponentTokens = allTokens.filter(
    (t) => t.colour !== botPlayerColour && isTokenMovable(t, diceNumber)
  );
  const botTokenHomeCoord = getHomeCoordForColour(botPlayerColour);

  // Find all bot tokens that can capture an opponent token with the current dice roll.
  // Among the possible captures, choose the one that targets the opponent token nearest to its Home (i.e., hardest for opponent to recover).
  // Return the bot token that should perform the capture, along with the flag indicating a second chance (as capturing grants another turn in Ludo).
  const nearestOpponentTokenToHome = (
    movableBotTokens
      .map((t) => {
        const finalCoord = getFinalCoord(t, diceNumber);
        if (!finalCoord) return null;
        const capturableToken = allTokens.find(
          (t) => t.colour !== botPlayerColour && areCoordsEqual(finalCoord, t.coordinates)
        );
        if (capturableToken) return { byWhichBotToken: t, opponentToken: capturableToken };
        return null;
      })
      .filter(Boolean) as TTokenCaptureInfo[]
  ).reduce<TTokenCaptureInfo | null>((prev, curr) => {
    if (!prev) return curr;
    const { opponentToken: prevOppToken } = prev;
    const { opponentToken: currOppToken } = curr;
    return getDistanceInTokenPath(
      prevOppToken.colour,
      prevOppToken.coordinates,
      getHomeCoordForColour(prevOppToken.colour)
    ) <
      getDistanceInTokenPath(
        currOppToken.colour,
        currOppToken.coordinates,
        getHomeCoordForColour(currOppToken.colour)
      )
      ? prev
      : curr;
  }, null);

  if (nearestOpponentTokenToHome) return nearestOpponentTokenToHome.byWhichBotToken;

  // If there exists a token that can be unlocked, unlock it and grant a second turn.
  const unlockableTokens = botTokens.filter((t) => t.isLocked && !t.hasTokenReachedHome);
  if (unlockableTokens.length > 0 && diceNumber === 6) return unlockableTokens[0];

  // Identify bot tokens that are at risk of being captured by an opponent's token.
  // A token is considered at risk if:
  // 1. It's not on a safe spot.
  // 2. An opponent's token is within 1 to 6 steps behind it on the token path.
  // If one or more at-risk tokens are found, return the one closest to home.
  const botTokensAtRisk = movableBotTokens.filter((t) => {
    if (isCoordASafeSpot(t.coordinates)) return false;
    for (let i = 0; i < movableOpponentTokens.length; i++) {
      const oppToken = movableOpponentTokens[i];
      const isBotTokenAheadOfOppToken = isAheadInTokenPath(t, oppToken);
      const dist = getDistanceBetweenTokens(t, oppToken);
      if (dist >= 1 && dist <= 6 && isBotTokenAheadOfOppToken) return true;
    }
    return false;
  });

  if (botTokensAtRisk.length > 0) return nearestTokenToHome(botTokensAtRisk, botPlayerColour);

  // Prioritize tokens that can enter or progress inside their Home Entry Path (safe, irreversible progress).
  // Select the one closest to Home and move it (no second chance granted).
  const tokensInOrEnteringHomePath = movableBotTokens.filter((t) => {
    const finalCoord = getFinalCoord(t, diceNumber);
    if (!finalCoord) return false;
    const willTokenBeInHomeEntryPath = isCoordInHomeEntryPathForColour(finalCoord, t.colour);
    return willTokenBeInHomeEntryPath;
  });
  if (tokensInOrEnteringHomePath.length > 0)
    return nearestTokenToHome(tokensInOrEnteringHomePath, botPlayerColour);

  // Check if any bot token can land on a safe spot with the current dice roll.
  // Among those tokens, select the one nearest to its Home (to maximize progress towards winning).
  // Moving to a safe spot prevents capture risks, but no extra turn is granted here.
  const tokensThatCanBeMovedToSafe = movableBotTokens.filter((t) => {
    const finalCoord = getFinalCoord(t, diceNumber);
    if (!finalCoord) return false;
    return isCoordASafeSpot(finalCoord);
  });

  if (tokensThatCanBeMovedToSafe.length > 0)
    return nearestTokenToHome(tokensThatCanBeMovedToSafe, botPlayerColour);

  // Move the token into Home if the dice number allows it to reach exactly
  const tokenThatCanReachHome = movableBotTokens.find(
    ({ colour, coordinates }) =>
      getDistanceInTokenPath(colour, coordinates, botTokenHomeCoord) === diceNumber
  );
  if (tokenThatCanReachHome) return tokenThatCanReachHome;

  // Calculate risk scores for each movable bot token based on multiple safety factors
  const tokenRisks = movableBotTokens
    .map((t) => {
      const finalCoord = getFinalCoord(t, diceNumber);
      if (!finalCoord) return;
      let riskScore = 0;

      // Heavy penalty if the token can be captured immediately by opponents
      if (canTokenBeCaptured(t, finalCoord, movableOpponentTokens)) riskScore += 15;

      // Add risk based on number of nearby active opponent tokens within dice range
      const nearbyThreats = countNearbyActiveOpponents(t, finalCoord, movableOpponentTokens);
      riskScore += nearbyThreats * 2;

      // Encourage moving towards safe spots only when there are nearby threats
      const distanceToSafeSpot = computeDistanceToNearestSafeSpot(t, finalCoord);
      if (nearbyThreats > 0) {
        // Increase risk score if the current coordinate is a safe spot
        if (isCoordASafeSpot(t.coordinates)) riskScore += 5;
        riskScore -= distanceToSafeSpot === -1 ? 0 : distanceToSafeSpot * 1;
      }

      return { token: t, riskScore };
    })
    .filter(Boolean) as { token: TToken; riskScore: number }[];

  const minRiskScore = Math.min(...tokenRisks.map((e) => e.riskScore));

  const tokensWithMinRiskScore = tokenRisks
    .filter((e) => e.riskScore === minRiskScore)
    .map((e) => e.token);

  return farthestTokenToHome(tokensWithMinRiskScore, botPlayerColour);
}
