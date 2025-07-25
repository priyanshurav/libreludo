import { FORWARD_TOKEN_TRANSITION_TIME } from '../../game/players/constants';
import { selectBestTokenForBot } from '../../game/tokens/selectBestTokenForBot';
import type { AppDispatch, RootState } from '../../gameStateStore';
import type { useMoveAndCaptureToken } from '../../hooks/useMoveAndCaptureToken';
import { setTokenTransitionTime } from '../../utils/setTokenTransitionTime';
import { changeTurn, deactivateAllTokens } from '../slices/playersSlice';
import { handlePostDiceRollThunk } from './handlePostDiceRollThunk';
import { rollDiceThunk } from './rollDiceThunk';
import { unlockAndAlignTokens } from './unlockAndAlignTokens';

// const at = [
//   {
//     id: 0,
//     colour: 'blue',
//     coordinates: {
//       x: 5,
//       y: 8,
//     },
//     isLocked: false,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 1.5,
//       y: 1.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 1,
//     colour: 'blue',
//     coordinates: {
//       x: 6,
//       y: 5,
//     },
//     isLocked: false,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 3.5,
//       y: 1.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 2,
//     colour: 'blue',
//     coordinates: {
//       x: 8,
//       y: 1,
//     },
//     isLocked: false,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 3.5,
//       y: 3.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 3,
//     colour: 'blue',
//     coordinates: {
//       x: 1.5,
//       y: 3.8,
//     },
//     isLocked: true,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 1.5,
//       y: 3.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 0,
//     colour: 'green',
//     coordinates: {
//       x: 6,
//       y: 2,
//     },
//     isLocked: false,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 10.5,
//       y: 12.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 1,
//     colour: 'green',
//     coordinates: {
//       x: 8,
//       y: 4,
//     },
//     isLocked: false,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 12.5,
//       y: 12.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 2,
//     colour: 'green',
//     coordinates: {
//       x: 2,
//       y: 8,
//     },
//     isLocked: false,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 10.5,
//       y: 10.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
//   {
//     id: 3,
//     colour: 'green',
//     coordinates: {
//       x: 12.5,
//       y: 10.8,
//     },
//     isLocked: true,
//     isActive: false,
//     isDirectionForward: true,
//     hasTokenReachedHome: false,
//     initialCoords: {
//       x: 12.5,
//       y: 10.8,
//     },
//     tokenAlignmentData: {
//       xOffset: 0,
//       yOffset: 0,
//       scaleFactor: 1,
//     },
//   },
// ];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const at = [
  {
    id: 0,
    colour: 'blue',
    coordinates: {
      x: 3,
      y: 8,
    },
    isLocked: false,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 1.5,
      y: 1.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 1,
    colour: 'blue',
    coordinates: {
      x: 3.5,
      y: 1.8,
    },
    isLocked: true,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 3.5,
      y: 1.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 2,
    colour: 'blue',
    coordinates: {
      x: 3.5,
      y: 3.8,
    },
    isLocked: true,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 3.5,
      y: 3.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 3,
    colour: 'blue',
    coordinates: {
      x: 1.5,
      y: 3.8,
    },
    isLocked: true,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 1.5,
      y: 3.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 0,
    colour: 'green',
    coordinates: {
      x: 10.5,
      y: 12.8,
    },
    isLocked: true,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 10.5,
      y: 12.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 1,
    colour: 'green',
    coordinates: {
      x: 0,
      y: 6,
    },
    isLocked: false,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 12.5,
      y: 12.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 2,
    colour: 'green',
    coordinates: {
      x: 10.5,
      y: 10.8,
    },
    isLocked: true,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 10.5,
      y: 10.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
  {
    id: 3,
    colour: 'green',
    coordinates: {
      x: 12.5,
      y: 10.8,
    },
    isLocked: true,
    isActive: false,
    isDirectionForward: true,
    hasTokenReachedHome: false,
    initialCoords: {
      x: 12.5,
      y: 10.8,
    },
    tokenAlignmentData: {
      xOffset: 0,
      yOffset: 0,
      scaleFactor: 1,
    },
  },
];

export function changeTurnThunk(moveAndCapture: ReturnType<typeof useMoveAndCaptureToken>) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().players.isGameEnded) return;

    dispatch(changeTurn());
    const { currentPlayerColour, players } = getState().players;

    const { colour, isBot } = players.find((p) => p.colour === currentPlayerColour);

    if (!isBot) return;

    const handleDiceRoll = async (diceNumber: number) => {
      const { shouldContinue, moveData: autoMoveData } = await dispatch(
        handlePostDiceRollThunk(colour, diceNumber, moveAndCapture)
      );
      dispatch(deactivateAllTokens(colour));

      const { players } = getState().players;

      const allTokens = players.flatMap((p) => p.tokens);
      if (!shouldContinue) return;
      if (autoMoveData) {
        const { hasTokenReachedHome, isCancelled } = autoMoveData;
        if (!isCancelled && !hasTokenReachedHome && diceNumber !== 6) {
          return setTimeout(() => dispatch(changeTurnThunk(moveAndCapture)), 1000);
        } else {
          return setTimeout(() => dispatch(rollDiceThunk(colour, handleDiceRoll)), 1000);
        }
      }

      const bestToken = selectBestTokenForBot(colour, diceNumber, allTokens);
      // console.log(bestToken);

      setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME);

      if (bestToken.isLocked && !bestToken.hasTokenReachedHome && diceNumber === 6) {
        dispatch(unlockAndAlignTokens({ colour, id: bestToken.id }));
        return setTimeout(() => dispatch(rollDiceThunk(colour, handleDiceRoll)), 1000);
      }
      const moveData = await moveAndCapture(bestToken, diceNumber);
      if (!moveData) return dispatch(changeTurnThunk(moveAndCapture));
      const { hasTokenReachedHome, isCancelled } = moveData;
      if (!isCancelled && !hasTokenReachedHome && diceNumber !== 6) {
        return setTimeout(() => dispatch(changeTurnThunk(moveAndCapture)), 1000);
      } else {
        return setTimeout(() => dispatch(rollDiceThunk(colour, handleDiceRoll)), 1000);
      }
    };
    dispatch(rollDiceThunk(colour, handleDiceRoll));
  };
}

// document.addEventListener('keypress', (e) => {
//   if (e.key !== 'j') return;
//   selectBestTokenForBot('green', 5, at as TToken[]);
// });
