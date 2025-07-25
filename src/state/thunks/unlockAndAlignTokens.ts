import type { AppDispatch, RootState } from '../../gameStateStore';
import { setTokenAlignmentData, unlockToken } from '../slices/playersSlice';
import { type TTokenColourAndId } from '../../types';
import { TOKEN_START_COORDINATES } from '../../game/tokens/constants';
import { getTokenAlignmentData } from '../../game/tokens/alignment';
import { tokensWithCoord } from '../../game/tokens/logic';

export function unlockAndAlignTokens({ colour, id }: TTokenColourAndId) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(unlockToken({ colour, id }));
    const allTokens = getState().players.players.flatMap((p) => p.tokens);
    const tokenStartCoord = TOKEN_START_COORDINATES[colour];
    const tokensInStartCoord = tokensWithCoord(tokenStartCoord, allTokens);
    const alignmentData = getTokenAlignmentData(tokensInStartCoord.length);
    tokensInStartCoord.forEach((t, i) => {
      dispatch(
        setTokenAlignmentData({ colour: t.colour, id: t.id, newAlignmentData: alignmentData[i] })
      );
    });
  };
}
