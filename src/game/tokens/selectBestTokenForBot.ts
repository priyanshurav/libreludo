import type { TCoordinate, TPlayerColour } from '../../types';
import type { TToken } from '../../types';
import { TOKEN_SAFE_COORDINATES } from './constants';
import { isTokenMovable } from './logic';
import {
  isCoordASafeSpot,
  isCoordInHomeEntryPathForColour,
  isTokenAhead,
  getDistanceBetweenTokens,
  getDistanceInTokenPath,
  getHomeCoordForColour,
  areCoordsEqual,
} from '../coords/logic';
import { tokenPaths } from './paths';
import { sample } from 'lodash';

type TTokenCaptureInfo = { byWhichBotToken: TToken; opponentToken: TToken };

function getFinalCoord(token: TToken, diceNumber: number): TCoordinate | null {
  const tokenPath = tokenPaths[token.colour];
  const currentCoordIndex = tokenPath.findIndex((c) => areCoordsEqual(token.coordinates, c));
  if (currentCoordIndex === -1) return null;
  const finalIndex = currentCoordIndex + diceNumber;
  if (finalIndex >= tokenPath.length) return null;
  const finalCoord = tokenPath[finalIndex];
  return finalCoord;
}

function getTokenProgress(token: TToken): number {
  const { colour, coordinates, isLocked } = token;
  if (isLocked) return 0;
  const tokenPathLength = tokenPaths[colour].length;
  const dist = getDistanceInTokenPath(colour, coordinates, getHomeCoordForColour(colour));
  return (tokenPathLength - dist) / tokenPathLength;
}

function calculateProximityRisk(distance: number, threat: TToken, token: TToken): number {
  const baseRisk = (7 - distance) * 2.5;
  const threatProgress = getTokenProgress(threat);
  const tokenProgress = getTokenProgress(token);
  const threatMobility = Math.min(1, threatProgress + 0.3);

  return baseRisk * (threatProgress > tokenProgress ? 1.3 : 1) * (1 + threatMobility * 0.2);
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
    const tokenDistance = getDistanceInTokenPath(token.colour, token.coordinates, playerHomeCoord);
    return tokenDistance < nearestDistance ? token : nearest;
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
      isTokenAhead(oppToken, { ...botToken, coordinates: tokenFinalCoord })
    )
      continue;
    const dist = getDistanceBetweenTokens({ ...botToken, coordinates: tokenFinalCoord }, oppToken);
    if (dist >= 1 && dist <= 6) return true;
  }
  return false;
}

function getNearbyActiveOpponents(
  botToken: TToken,
  tokenFinalCoord: TCoordinate,
  opponentTokens: TToken[]
): TToken[] {
  if (isCoordInHomeEntryPathForColour(tokenFinalCoord, botToken.colour)) return [];
  return opponentTokens.filter((oppToken) => {
    if (isCoordInHomeEntryPathForColour(oppToken.coordinates, oppToken.colour)) return false;
    const dist = getDistanceBetweenTokens({ ...botToken, coordinates: tokenFinalCoord }, oppToken);
    if (dist >= 1 && dist <= 6) return true;
    return false;
  });
}

function calculatePositionalBonus(
  isFinalSafe: boolean,
  distanceToSafeSpot: number,
  tokenProgress: number
): number {
  let bonus = 0;

  if (isFinalSafe) {
    bonus += 10;
  } else if (distanceToSafeSpot !== -1 && distanceToSafeSpot <= 6) {
    const proximityBonus = Math.max(1, 7 - distanceToSafeSpot);
    bonus += proximityBonus;
  }

  const progressBonus = tokenProgress * 3;
  bonus += progressBonus;

  return bonus;
}

function assessDefensivePosition(
  finalCoord: TCoordinate,
  friendlyTokens: TToken[],
  nearbyThreats: number
) {
  let defensiveValue = 0;

  const friendliesAtPosition = friendlyTokens.filter((token) =>
    areCoordsEqual(token.coordinates, finalCoord)
  ).length;

  if (friendliesAtPosition > 0) {
    defensiveValue += friendliesAtPosition * 2;
  }

  friendlyTokens.forEach((friendly) => {
    const distanceToFriendly = getDistanceBetweenTokens(
      { ...friendly, coordinates: finalCoord },
      friendly
    );

    if (distanceToFriendly >= 1 && distanceToFriendly <= 3) {
      defensiveValue += Math.max(0, 3 - distanceToFriendly);
    }
  });

  const advancedFriendlies = friendlyTokens.filter((token) => getTokenProgress(token) > 0.7);

  advancedFriendlies.forEach((advanced) => {
    const distanceToAdvanced = getDistanceBetweenTokens(
      { ...advanced, coordinates: finalCoord },
      advanced
    );

    if (distanceToAdvanced >= 1 && distanceToAdvanced <= 2) {
      defensiveValue += 3;
    }
  });

  if (nearbyThreats > 2) {
    defensiveValue = Math.max(0, defensiveValue - nearbyThreats);
  }

  return defensiveValue;
}

function assessClusteringRisk(
  token: TToken,
  finalCoord: TCoordinate,
  botTokens: TToken[],
  threatCount: number
): number {
  const friendlyAtFinal = botTokens.filter(
    (other) => other.id !== token.id && areCoordsEqual(other.coordinates, finalCoord)
  ).length;

  const friendlyAtCurrent = botTokens.filter(
    (other) => other.id !== token.id && areCoordsEqual(other.coordinates, token.coordinates)
  ).length;

  let clusterRisk = 0;

  if (friendlyAtFinal > 0) {
    const threatMultiplier = Math.max(0.3, 1 - threatCount * 0.2);
    const clusterPenalty = Math.ceil(friendlyAtFinal * 3 * threatMultiplier);
    clusterRisk += clusterPenalty;
  }

  if (friendlyAtCurrent > 0 && threatCount === 0) {
    const spreadIncentive = Math.ceil(friendlyAtCurrent * 0.8);
    clusterRisk += spreadIncentive;
  }

  return clusterRisk;
}

function computeDistanceToNearestSafeSpot(botToken: TToken, tokenFinalCoord: TCoordinate): number {
  if (isCoordInHomeEntryPathForColour(tokenFinalCoord, botToken.colour)) return -1;
  const nearestSafeSpot = TOKEN_SAFE_COORDINATES.filter((c) =>
    isTokenAhead({ ...botToken, coordinates: c }, botToken)
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
          (token) =>
            token.colour !== botPlayerColour && areCoordsEqual(finalCoord, token.coordinates)
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
      const isBotTokenAheadOfOppToken = isTokenAhead(t, oppToken);
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

      const nearbyThreats = getNearbyActiveOpponents(t, finalCoord, movableOpponentTokens);
      const distanceToSafeSpot = computeDistanceToNearestSafeSpot(t, finalCoord);
      const isCurrentSafe = isCoordASafeSpot(t.coordinates);
      const isFinalSafe = isCoordASafeSpot(finalCoord);
      const tokenProgress = getTokenProgress(t);

      if (canTokenBeCaptured(t, finalCoord, movableOpponentTokens)) {
        const progressMultiplier = Math.pow(tokenProgress, 2);
        const baseCaptureRisk = 15;
        const captureRisk = baseCaptureRisk + progressMultiplier * 25;
        riskScore += captureRisk;
      }

      if (isCurrentSafe && !isFinalSafe && nearbyThreats.length > 0) {
        const safetyExitRisk = 12 + nearbyThreats.length * 3;
        riskScore += safetyExitRisk;
      }

      nearbyThreats.forEach((threat) => {
        const distance = getDistanceBetweenTokens(t, threat);
        if (distance >= 1 && distance <= 6) {
          const proximityRisk = calculateProximityRisk(distance, threat, t);
          riskScore += proximityRisk;
        }
      });

      const clusteringRisk = assessClusteringRisk(
        t,
        finalCoord,
        movableBotTokens,
        nearbyThreats.length
      );

      riskScore += clusteringRisk;

      const positionalBonus = calculatePositionalBonus(
        isFinalSafe,
        distanceToSafeSpot,
        tokenProgress
      );

      riskScore -= positionalBonus;

      const defensiveValue = assessDefensivePosition(
        finalCoord,
        movableBotTokens,
        nearbyThreats.length
      );

      riskScore -= defensiveValue;

      return { token: t, riskScore };
    })
    .filter(Boolean) as { token: TToken; riskScore: number }[];

  if (tokenRisks.length === 0) return null;

  const minRiskScore = Math.min(...tokenRisks.map((e) => e.riskScore));
  const tokensWithMinRiskScore = tokenRisks
    .filter((e) => e.riskScore === minRiskScore)
    .map((e) => e.token);

  return sample(tokensWithMinRiskScore) || null;
}
