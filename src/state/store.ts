import {
  combineReducers,
  configureStore,
  createAction,
  type PayloadAction,
} from '@reduxjs/toolkit';
import playersReducer from './slices/playersSlice';
import boardReducer from './slices/boardSlice';
import diceReducer from './slices/diceSlice';
import sessionReducer from './slices/sessionSlice';

export const hydrateRootState = createAction<RootState>('root/hydrateState');

const appReducer = combineReducers({
  players: playersReducer,
  board: boardReducer,
  dice: diceReducer,
  session: sessionReducer,
});

const rootReducer = (state: RootState | undefined, action: PayloadAction<RootState>) => {
  if (action.type === hydrateRootState.type) {
    return action.payload;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
