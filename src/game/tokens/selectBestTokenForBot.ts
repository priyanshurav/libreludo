import type { TCoordinate, TPlayerColour } from '../../types';
import type { TToken } from '../../types';
import { isTokenMovable } from './logic';
import {
  isCoordASafeSpot,
  isCoordInHomeEntryPathForColour,
  isTokenAhead,
  getDistanceBetweenTokens,
  getDistanceInTokenPath,
  getHomeCoordForColour,
  areCoordsEqual,
  getFinalCoord,
} from '../coords/logic';
import { expandedGeneralTokenPath, tokenPaths } from './paths';
import { sample } from 'lodash';

export function selectBestTokenForBot(
  botPlayerColour: TPlayerColour,
  diceNumber: number,
  allTokens: TToken[]
): TToken | null {
  const botTokens = allTokens.filter((t) => t.colour === botPlayerColour);
  const movableBotTokens = botTokens.filter((t) => isTokenMovable(t, diceNumber));
  const botTokenHomeCoord = getHomeCoordForColour(botPlayerColour);
  const activeOpponentTokens = allTokens.filter(
    (t) =>
      t.colour !== botPlayerColour &&
      isTokenMovable(t) &&
      expandedGeneralTokenPath.find((c) => areCoordsEqual(t.coordinates, c))
  );

  const tokenScores = botTokens.map<{ token: TToken; feasibilityScore: number }>((token) => {
    let feasibilityScore = 0;
    let finalCoord: TCoordinate | null = null;

    // Prioritize unlocking tokens on 6
    const isUnlockable = token.isLocked && !token.hasTokenReachedHome && diceNumber === 6;
    if (isUnlockable) {
      feasibilityScore += 50000;
      finalCoord = tokenPaths[token.colour][0];
    } else {
      finalCoord = getFinalCoord(token, diceNumber);
      if (!isTokenMovable(token, diceNumber) || !finalCoord)
        return { token, feasibilityScore: -Infinity };
    }
    if (!finalCoord) return { token, feasibilityScore: -Infinity };

    const isFinalCoordSafe = isCoordASafeSpot(finalCoord, token.colour);
    const isCurrentCoordSafe = isCoordASafeSpot(token.coordinates, token.colour);
    const botTokensAtHome = botTokens.filter((t) => t.hasTokenReachedHome).length;
    const endgameMultiplier = botTokensAtHome >= 3 ? 10 : 1;
    const safetyMultiplier = botTokensAtHome > 2 ? 2 : 1;

    // Capture scoring
    const capturableTokens = allTokens.filter(
      (t) =>
        t.colour !== botPlayerColour &&
        areCoordsEqual(finalCoord, t.coordinates) &&
        !isCoordASafeSpot(t.coordinates, t.colour)
    );

    capturableTokens.forEach((t) => {
      const distToEnd = getDistanceInTokenPath(
        t.colour,
        t.coordinates,
        getHomeCoordForColour(t.colour)
      );
      const distTraveled = tokenPaths[t.colour].length - distToEnd;

      feasibilityScore += 60000 + distTraveled * 1000;
    });

    // Safe spot and home path bonuses
    if (isFinalCoordSafe) feasibilityScore += 5000;
    const isTokenAlreadyInHomeEntryPath = isCoordInHomeEntryPathForColour(
      token.coordinates,
      token.colour
    );
    const willTokenBeInHomeEntryPath = isCoordInHomeEntryPathForColour(finalCoord, token.colour);
    if (willTokenBeInHomeEntryPath && !isTokenAlreadyInHomeEntryPath) feasibilityScore += 5000;

    // Avoid moving tokens already inside home path
    if (isTokenAlreadyInHomeEntryPath) feasibilityScore -= 10000;

    if (token.isLocked) return { token, feasibilityScore };

    // Distance scoring
    const distFromHome = getDistanceInTokenPath(token.colour, token.coordinates, botTokenHomeCoord);
    const botTokensInCurrentCoord = movableBotTokens.filter((t) =>
      areCoordsEqual(t.coordinates, token.coordinates)
    ).length;
    const canTokenReachHome = distFromHome === diceNumber;
    if (canTokenReachHome) feasibilityScore += 150000;
    feasibilityScore -= distFromHome * 150 * endgameMultiplier;

    // Break crowded safe spots on 6
    const oppTokensAtCurrentCoord = activeOpponentTokens.filter((oppToken) =>
      areCoordsEqual(oppToken.coordinates, token.coordinates)
    ).length;
    const isCrowdedSafeSpotAndRolled6 =
      diceNumber === 6 && isCurrentCoordSafe && oppTokensAtCurrentCoord > 0;
    if (isCrowdedSafeSpotAndRolled6) feasibilityScore += 10000;

    // Avoid stacking outside safe zones
    const botTokensInFinalCoord = movableBotTokens.filter((t) =>
      areCoordsEqual(t.coordinates, finalCoord)
    ).length;
    if (botTokensInFinalCoord > 0 && !isFinalCoordSafe) {
      feasibilityScore -= 65000;
    }

    let isSafeLaunchHunter = false;

    for (let i = 0; i < activeOpponentTokens.length; i++) {
      const oppToken = activeOpponentTokens[i];
      const isBotTokenAheadOfOppTokenInFuture = isTokenAhead(
        { ...token, coordinates: finalCoord },
        oppToken
      );
      const futureDist = getDistanceBetweenTokens({ ...token, coordinates: finalCoord }, oppToken);
      const isBotTokenAheadOfOppTokenCurrently = isTokenAhead(token, oppToken);
      const currentDist = getDistanceBetweenTokens(token, oppToken);

      // Chase if safe
      if (currentDist >= 1 && currentDist <= 15 && !isBotTokenAheadOfOppTokenCurrently) {
        const isThreatenedFromBehind = activeOpponentTokens.some((t) => {
          const dist = getDistanceBetweenTokens(token, t);
          const isOpponentBehind = isTokenAhead(token, t);
          return isOpponentBehind && dist >= 1 && dist <= 12;
        });
        if (!isThreatenedFromBehind || isFinalCoordSafe || isCurrentCoordSafe) {
          if (currentDist <= 6) feasibilityScore += 15000;
          feasibilityScore += 20000;
          isSafeLaunchHunter = true;
        } else if (currentDist <= 8) {
          feasibilityScore += 10000;
          if (currentDist <= 6) feasibilityScore += 15000;
        }
      }

      // Run if chased and unsafe
      if (
        currentDist >= 1 &&
        currentDist <= 12 &&
        isBotTokenAheadOfOppTokenCurrently &&
        !isCurrentCoordSafe
      ) {
        const distFromStart = tokenPaths[token.colour].length - distFromHome;
        if (distFromStart > 25) {
          feasibilityScore += 55000;
        } else {
          feasibilityScore += 42000;
        }
      }

      // Calculate escape value
      if (futureDist >= 1 && futureDist <= 12 && isBotTokenAheadOfOppTokenInFuture) {
        const isEscaping =
          isBotTokenAheadOfOppTokenCurrently && futureDist > currentDist && !isCurrentCoordSafe;

        if (isEscaping) {
          feasibilityScore += (futureDist - currentDist) * 5000;
          if (currentDist <= 6) feasibilityScore += 15000;
          if (isFinalCoordSafe) feasibilityScore += 30000;
          else feasibilityScore -= 10000;
        } else {
          feasibilityScore -= 60000 * safetyMultiplier;
        }
      }
    }

    // Stick to safe spots unless necessary
    if (isCurrentCoordSafe && !isSafeLaunchHunter && !isCrowdedSafeSpotAndRolled6) {
      feasibilityScore -= 5000;
    } else if (botTokensInCurrentCoord > 1) {
      feasibilityScore += botTokensInCurrentCoord * 2000;
    }

    return { token, feasibilityScore };
  });
  if (tokenScores.length === 0) return null;
  const maxScore = Math.max(...tokenScores.map((e) => e.feasibilityScore));
  const tokensWithMaxFeasibilityScore = tokenScores
    .filter((e) => e.feasibilityScore === maxScore)
    .map((e) => e.token);

  return sample(tokensWithMaxFeasibilityScore) || null;
}
