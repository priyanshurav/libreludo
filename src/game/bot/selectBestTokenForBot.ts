import type { TCoordinate, TPlayerColour } from '../../types';
import type { TToken } from '../../types';
import { isTokenMovable } from '../tokens/logic';
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
import { expandedGeneralTokenPath, tokenPaths } from '../tokens/paths';
import { sample } from 'lodash-es';
import { LOGIC_CONFIG, WEIGHTS } from './constants';

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

    // Always try to unlock a new token if we rolled a 6.
    const isUnlockable =
      token.isLocked && !token.hasTokenReachedHome && diceNumber === LOGIC_CONFIG.UNLOCK_DICE_VALUE;
    if (isUnlockable) {
      feasibilityScore += WEIGHTS.UNLOCK_BONUS;
      finalCoord = tokenPaths[token.colour][0];
    } else {
      finalCoord = getFinalCoord(token, diceNumber);
      // If the move is not allowed (like going past the finish line), stop here.
      if (!isTokenMovable(token, diceNumber)) return { token, feasibilityScore: -Infinity };
    }

    if (!finalCoord) return { token, feasibilityScore: -Infinity };

    const isFinalCoordSafe = isCoordASafeSpot(finalCoord, token.colour);
    const isCurrentCoordSafe = isCoordASafeSpot(token.coordinates, token.colour);
    const botTokensAtHome = botTokens.filter((t) => t.hasTokenReachedHome).length;

    // Play more carefully if we are close to winning the game.
    const endgameMultiplier =
      botTokensAtHome >= LOGIC_CONFIG.ENDGAME_TOKEN_COUNT
        ? LOGIC_CONFIG.ENDGAME_SCORE_MULTIPLIER
        : LOGIC_CONFIG.DEFAULT_MULTIPLIER;

    const safetyMultiplier =
      botTokensAtHome > LOGIC_CONFIG.SAFETY_TOKEN_COUNT
        ? LOGIC_CONFIG.SAFETY_SCORE_MULTIPLIER
        : LOGIC_CONFIG.DEFAULT_MULTIPLIER;

    // Check if we can capture any enemies with this move.
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

      // Score points for capturing. Capture is worth more if the enemy has traveled far.
      feasibilityScore +=
        WEIGHTS.CAPTURE_BASE + distTraveled * WEIGHTS.OPPONENT_PROGRESS_MULTIPLIER;
    });

    // Give a bonus for landing on a safe spot.
    if (isFinalCoordSafe) feasibilityScore += WEIGHTS.SAFE_POSITION_BONUS;

    const isTokenAlreadyInHomeEntryPath = isCoordInHomeEntryPathForColour(
      token.coordinates,
      token.colour
    );
    const willTokenBeInHomeEntryPath = isCoordInHomeEntryPathForColour(finalCoord, token.colour);

    // Reward the token for entering the home entry path.
    if (willTokenBeInHomeEntryPath && !isTokenAlreadyInHomeEntryPath)
      feasibilityScore += WEIGHTS.HOME_ENTRY_BONUS;

    // Avoid moving tokens that are already safe inside the home path.
    if (isTokenAlreadyInHomeEntryPath) feasibilityScore -= WEIGHTS.SAFE_TOKEN_MOVE_PENALTY;

    // If the token is still locked, we are done calculating.
    if (token.isLocked) return { token, feasibilityScore };

    const distFromHome = getDistanceInTokenPath(token.colour, token.coordinates, botTokenHomeCoord);
    const botTokensInCurrentCoord = movableBotTokens.filter((t) =>
      areCoordsEqual(t.coordinates, token.coordinates)
    ).length;

    // Big bonus if this move finishes the game for this token.
    const canTokenReachHome = distFromHome === diceNumber;
    if (canTokenReachHome) feasibilityScore += WEIGHTS.GOAL_COMPLETION_BONUS;

    // General rule: Try to move tokens that are closer to the finish line.
    feasibilityScore -= distFromHome * WEIGHTS.BASE_DISTANCE_PENALTY * endgameMultiplier;

    const oppTokensAtCurrentCoord = activeOpponentTokens.filter((oppToken) =>
      areCoordsEqual(oppToken.coordinates, token.coordinates)
    ).length;

    // If we are on a safe spot with an enemy and roll a 6, try to leave (to avoid stagnation)
    const isCrowdedSafeSpotAndRolled6 =
      diceNumber === LOGIC_CONFIG.UNLOCK_DICE_VALUE &&
      isCurrentCoordSafe &&
      oppTokensAtCurrentCoord > 0;
    if (isCrowdedSafeSpotAndRolled6) feasibilityScore += WEIGHTS.CROWDED_EXIT_BONUS;

    // Don't put two tokens on the same spot unless it is safe (avoids double kills).
    const botTokensInFinalCoord = movableBotTokens.filter((t) =>
      areCoordsEqual(t.coordinates, finalCoord)
    ).length;
    if (botTokensInFinalCoord > 0 && !isFinalCoordSafe) {
      feasibilityScore -= WEIGHTS.UNSAFE_STACKING_PENALTY;
    }

    let isSafeLaunchHunter = false;

    // Check every enemy to see if we are chasing them or they are chasing us.
    for (let i = 0; i < activeOpponentTokens.length; i++) {
      const oppToken = activeOpponentTokens[i];
      const isBotTokenAheadOfOppTokenInFuture = isTokenAhead(
        { ...token, coordinates: finalCoord },
        oppToken
      );
      const futureDist = getDistanceBetweenTokens({ ...token, coordinates: finalCoord }, oppToken);
      const isBotTokenAheadOfOppTokenCurrently = isTokenAhead(token, oppToken);
      const currentDist = getDistanceBetweenTokens(token, oppToken);

      // HUNTER LOGIC: We are behind them (chasing).
      if (
        currentDist >= 1 &&
        currentDist <= LOGIC_CONFIG.MAX_CHASE_LOOKAHEAD &&
        !isBotTokenAheadOfOppTokenCurrently
      ) {
        // Check if someone else is chasing US from behind.
        const isThreatenedFromBehind = activeOpponentTokens.some((t) => {
          const dist = getDistanceBetweenTokens(token, t);
          const isOpponentBehind = isTokenAhead(token, t);
          return isOpponentBehind && dist >= 1 && dist <= LOGIC_CONFIG.MAX_THREAT_LOOKAHEAD;
        });

        // Safe Hunt: No one is behind us, or we are jumping to a safe spot.
        if (!isThreatenedFromBehind || isFinalCoordSafe) {
          if (currentDist <= LOGIC_CONFIG.CRITICAL_COMBAT_RANGE)
            feasibilityScore += WEIGHTS.SAFE_HUNT_CRITICAL_RANGE_BONUS;
          feasibilityScore += WEIGHTS.SAFE_CHASE_BASE_BONUS;
          if (!isThreatenedFromBehind) isSafeLaunchHunter = true;
        }
        // Risky Hunt: Someone is behind us, but we want to attack anyway.
        else if (currentDist <= LOGIC_CONFIG.RISKY_ATTACK_RANGE) {
          feasibilityScore += WEIGHTS.RISKY_CHASE_BASE_BONUS;
          if (currentDist <= LOGIC_CONFIG.CRITICAL_COMBAT_RANGE)
            feasibilityScore += WEIGHTS.RISKY_HUNT_CRITICAL_RANGE_BONUS;
        }
      }

      // ESCAPE LOGIC: We are ahead of them (being chased).
      // If we are being chased, prioritize saving tokens that have traveled a long way.
      if (
        currentDist >= 1 &&
        currentDist <= LOGIC_CONFIG.MAX_THREAT_LOOKAHEAD &&
        isBotTokenAheadOfOppTokenCurrently &&
        !isCurrentCoordSafe
      ) {
        const distFromStart = tokenPaths[token.colour].length - distFromHome;
        if (distFromStart > LOGIC_CONFIG.HIGH_INVESTMENT_DIST) {
          feasibilityScore += WEIGHTS.HIGH_INVESTMENT_ESCAPE_PRIORITY;
        } else {
          feasibilityScore += WEIGHTS.LOW_INVESTMENT_ESCAPE_PRIORITY;
        }
      }

      // Check if this move helps us escape.
      if (
        futureDist >= 1 &&
        futureDist <= LOGIC_CONFIG.MAX_THREAT_LOOKAHEAD &&
        isBotTokenAheadOfOppTokenInFuture
      ) {
        const isEscaping =
          isBotTokenAheadOfOppTokenCurrently && futureDist > currentDist && !isCurrentCoordSafe;

        if (isEscaping) {
          // Reward moves that put more distance between us and the chaser.
          feasibilityScore += (futureDist - currentDist) * WEIGHTS.ESCAPE_DISTANCE_MULTIPLIER;
          if (currentDist <= LOGIC_CONFIG.CRITICAL_COMBAT_RANGE)
            feasibilityScore += WEIGHTS.CRITICAL_ESCAPE_BONUS;

          // Bonus if we run to a safe spot; Penalty if we run but are still unsafe.
          if (isFinalCoordSafe) feasibilityScore += WEIGHTS.SAFE_HAVEN_BONUS;
          else feasibilityScore -= WEIGHTS.UNSAFE_ESCAPE_PENALTY;
        } else {
          // If we are not escaping, don't leave a safe spot just to stand in danger.
          const isProtected = isFinalCoordSafe || willTokenBeInHomeEntryPath;
          if (!isProtected && isCurrentCoordSafe)
            feasibilityScore -= WEIGHTS.SAFE_SPOT_ABANDONMENT_PENALTY * safetyMultiplier;
        }
      }
    }

    // Try to stay on safe spots unless we have a reason to leave (like hunting).
    if (isCurrentCoordSafe && !isSafeLaunchHunter && !isCrowdedSafeSpotAndRolled6) {
      feasibilityScore -= WEIGHTS.SAFE_SPOT_EXIT_PENALTY;
    }
    // If two tokens are on the same spot, try to separate them to cover more board.
    else if (botTokensInCurrentCoord > 1) {
      feasibilityScore += botTokensInCurrentCoord * WEIGHTS.STACK_SPLIT_BONUS;
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
