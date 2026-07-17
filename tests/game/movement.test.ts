import { describe, expect, it } from 'vitest';
import { calculateSequence } from '../../src/game/movement/calculateSequence';
import { playerSequences } from '../../src/game/players/constants';
import { defaultTokenAlignmentData } from '../../src/game/tokens/alignment';
import { TOKEN_LOCKED_COORDINATES } from '../../src/game/tokens/constants';
import { tokenPaths } from '../../src/game/tokens/paths';
import { getPlayer, getToken } from '../../src/state/slices/playersSlice';
import type { RootState } from '../../src/state/store';
import type { TToken } from '../../src/types';
import { DUMMY_PLAYERS } from '../fixtures/players.dummy';
import { DUMMY_STATE } from '../fixtures/state.dummy';

function placeOnPath(token: TToken, pathIndex: number): void {
  token.coordinates = tokenPaths[token.colour][pathIndex];
  token.isLocked = false;
}

function buildState(): RootState {
  const state = structuredClone(DUMMY_STATE);
  state.players.players = structuredClone(DUMMY_PLAYERS);
  state.players.playerSequence = playerSequences.four;
  return state;
}

describe('Test game/movement', () => {
  describe('calculateSequence', () => {
    describe('basic movement', () => {
      it('advances the token to the coordinate diceNumber steps ahead on its path', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);

        const { nextState } = calculateSequence(state, mover, 4);

        expect(getToken(nextState.players, 'blue', 0).coordinates).toEqual(tokenPaths.blue[6]);
      });

      it('returns a moveSequence containing every intermediate tile up to and including the destination', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);

        const { moveSequence } = calculateSequence(state, mover, 4);

        expect(moveSequence).toEqual(tokenPaths.blue.slice(3, 7));
        expect(moveSequence).toHaveLength(4);
      });

      it('sets direction to forward when the token had no prior direction', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        mover.direction = null;

        const { nextState } = calculateSequence(state, mover, 3);

        expect(getToken(nextState.players, 'blue', 0).direction).toBe('forward');
      });

      it('preserves an existing backward direction instead of overwriting it', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        mover.direction = 'backward';

        const { nextState } = calculateSequence(state, mover, 3);

        expect(getToken(nextState.players, 'blue', 0).direction).toBe('backward');
      });

      it('does not mutate the original state or token passed in', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const originalCoords = { ...mover.coordinates };

        const { nextState } = calculateSequence(state, mover, 4);

        expect(mover.coordinates).toEqual(originalCoords);
        expect(getToken(state.players, 'blue', 0).coordinates).toEqual(originalCoords);
        expect(nextState).not.toBe(state);
        expect(nextState.players).not.toBe(state.players);
      });

      it.each(playerSequences.four)(
        'computes the same forward-movement arithmetic for the %s path',
        (colour) => {
          const state = buildState();
          const mover = getToken(state.players, colour, 0);
          placeOnPath(mover, 3);

          const { nextState, moveSequence } = calculateSequence(state, mover, 5);

          expect(getToken(nextState.players, colour, 0).coordinates).toEqual(tokenPaths[colour][8]);
          expect(moveSequence).toEqual(tokenPaths[colour].slice(4, 9));
        }
      );
    });

    describe('deactivating tokens', () => {
      it("deactivates every one of the moving player's tokens, locked or not", () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        mover.isActive = true;
        const lockedActiveToken = getToken(state.players, 'blue', 1);
        lockedActiveToken.isActive = true;

        const { nextState } = calculateSequence(state, mover, 4);

        expect(getToken(nextState.players, 'blue', 0).isActive).toBe(false);
        expect(getToken(nextState.players, 'blue', 1).isActive).toBe(false);
      });

      it('does not affect the active state of other players tokens', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        getToken(state.players, 'red', 0).isActive = true;

        const { nextState } = calculateSequence(state, mover, 4);

        expect(getToken(nextState.players, 'red', 0).isActive).toBe(true);
      });
    });

    describe('capturing opponent tokens', () => {
      it('captures a single opponent token occupying the destination tile', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const enemy = getToken(state.players, 'red', 0);
        placeOnPath(enemy, 45);
        enemy.tokenAlignmentData = { xOffset: 0.5, yOffset: -0.5, scaleFactor: 0.75 };

        const { nextState, captureData } = calculateSequence(state, mover, 4);

        expect(captureData).toHaveLength(1);
        expect(captureData[0].token.colour).toBe('red');
        expect(captureData[0].token.id).toBe(0);

        const capturedInNextState = getToken(nextState.players, 'red', 0);
        expect(capturedInNextState.isLocked).toBe(true);
        expect(capturedInNextState.direction).toBe('forward');
        expect(capturedInNextState.coordinates).toEqual(TOKEN_LOCKED_COORDINATES.red[0]);
        expect(capturedInNextState.tokenAlignmentData).toEqual(defaultTokenAlignmentData);
      });

      it('returns the captured token moveSequence as its own path reversed back to its start', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const enemy = getToken(state.players, 'red', 0);
        placeOnPath(enemy, 45);

        const { captureData } = calculateSequence(state, mover, 4);

        expect(captureData[0].moveSequence).toEqual(tokenPaths.red.slice(0, 46).reverse());
        expect(captureData[0].moveSequence[0]).toEqual(tokenPaths.red[45]);
        expect(captureData[0].moveSequence.at(-1)).toEqual(tokenPaths.red[0]);
      });

      it('captures every opponent token on the destination tile, regardless of colour', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const redEnemy = getToken(state.players, 'red', 0);
        placeOnPath(redEnemy, 45);
        const greenEnemy = getToken(state.players, 'green', 0);
        placeOnPath(greenEnemy, 32);

        const { nextState, captureData } = calculateSequence(state, mover, 4);

        expect(captureData).toHaveLength(2);
        expect(captureData.map((c) => c.token.colour).sort()).toEqual(['green', 'red']);
        expect(getToken(nextState.players, 'red', 0).isLocked).toBe(true);
        expect(getToken(nextState.players, 'green', 0).isLocked).toBe(true);
      });

      it('does not capture tokens belonging to the same colour (stacking is allowed)', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const teammate = getToken(state.players, 'blue', 1);
        placeOnPath(teammate, 6);

        const { nextState, captureData } = calculateSequence(state, mover, 4);

        expect(captureData).toHaveLength(0);
        expect(getToken(nextState.players, 'blue', 1).isLocked).toBe(false);
        expect(getToken(nextState.players, 'blue', 1).coordinates).toEqual(tokenPaths.blue[6]);
      });

      it('does not capture an opponent token sitting on a safe tile', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 4);
        const enemy = getToken(state.players, 'red', 0);
        placeOnPath(enemy, 47);

        const { nextState, captureData } = calculateSequence(state, mover, 4);

        expect(captureData).toHaveLength(0);
        const untouchedEnemy = getToken(nextState.players, 'red', 0);
        expect(untouchedEnemy.isLocked).toBe(false);
        expect(untouchedEnemy.coordinates).toEqual(tokenPaths.red[47]);
      });

      it('leaves opponents on other tiles untouched', () => {
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const farAwayEnemy = getToken(state.players, 'red', 0);
        placeOnPath(farAwayEnemy, 0);

        const { nextState, captureData } = calculateSequence(state, mover, 4);

        expect(captureData).toHaveLength(0);
        expect(getToken(nextState.players, 'red', 0)).toEqual(farAwayEnemy);
      });
    });

    describe('reaching home', () => {
      it('marks the token as having reached home when it lands on the final path tile', () => {
        const lastIndex = tokenPaths.blue.length - 1;
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, lastIndex - 6);

        const { nextState } = calculateSequence(state, mover, 6);

        const moved = getToken(nextState.players, 'blue', 0);
        expect(moved.hasTokenReachedHome).toBe(true);
        expect(moved.isLocked).toBe(true);
        expect(moved.coordinates).toEqual(tokenPaths.blue[lastIndex]);
      });

      it('does not mark the token as home when it lands short of the final tile', () => {
        const lastIndex = tokenPaths.blue.length - 1;
        const state = buildState();
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, lastIndex - 6);

        const { nextState } = calculateSequence(state, mover, 5);

        const moved = getToken(nextState.players, 'blue', 0);
        expect(moved.hasTokenReachedHome).toBe(false);
        expect(moved.isLocked).toBe(false);
      });
    });

    describe('turn changes', () => {
      it('passes the turn to the next player when nothing special happens and the roll was not a six', () => {
        const state = buildState();
        state.players.currentPlayerColour = 'blue';
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);

        const { nextState } = calculateSequence(state, mover, 4);

        expect(nextState.players.currentPlayerColour).toBe('red');
      });

      it('grants another turn to the same player when the roll was a six', () => {
        const state = buildState();
        state.players.currentPlayerColour = 'blue';
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);

        const { nextState } = calculateSequence(state, mover, 6);

        expect(nextState.players.currentPlayerColour).toBe('blue');
      });

      it('grants another turn when a capture occurs, even on a non-six roll', () => {
        const state = buildState();
        state.players.currentPlayerColour = 'blue';
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, 2);
        const enemy = getToken(state.players, 'red', 0);
        placeOnPath(enemy, 45);

        const { nextState } = calculateSequence(state, mover, 4);

        expect(nextState.players.currentPlayerColour).toBe('blue');
      });

      it('grants another turn when the token reaches home, even on a non-six roll', () => {
        const lastIndex = tokenPaths.blue.length - 1;
        const state = buildState();
        state.players.currentPlayerColour = 'blue';
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, lastIndex - 3);
        placeOnPath(getToken(state.players, 'blue', 1), 0);

        const { nextState } = calculateSequence(state, mover, 3);

        expect(nextState.players.currentPlayerColour).toBe('blue');
      });

      it('passes the turn even on a six once the winning move brings the last token home', () => {
        const lastIndex = tokenPaths.blue.length - 1;
        const state = buildState();
        state.players.currentPlayerColour = 'blue';
        const player = getPlayer(state.players, 'blue');
        player.tokens.slice(1).forEach((t) => {
          t.hasTokenReachedHome = true;
          t.isLocked = true;
        });
        const mover = getToken(state.players, 'blue', 0);
        placeOnPath(mover, lastIndex - 6);

        const { nextState } = calculateSequence(state, mover, 6);

        expect(
          getPlayer(nextState.players, 'blue').tokens.every((t) => t.hasTokenReachedHome)
        ).toBe(true);
        expect(nextState.players.playerSequence).toEqual(['red', 'green', 'yellow']);
        expect(nextState.players.currentPlayerColour).toBe('red');
      });

      it('wraps back around to the first player in the sequence', () => {
        const state = buildState();
        state.players.playerSequence = playerSequences.two;
        state.players.currentPlayerColour = 'green';
        const mover = getToken(state.players, 'green', 0);
        placeOnPath(mover, 2);

        const { nextState } = calculateSequence(state, mover, 4);

        expect(nextState.players.currentPlayerColour).toBe('blue');
      });
    });
  });
});
