import type { TCoordinate, TPlayerColour } from '../../types';
import type { TTokenPath } from '../../types';
import { TOKEN_HOME_ENTRY_PATH, GENERAL_TOKEN_PATH } from './constants';
function getIntegersBetween(a: number, b: number) {
  let result = [];
  const start = Math.min(a, b) + 1;
  const end = Math.max(a, b);

  for (let i = start; i < end; i++) {
    result.push(i);
  }

  if (a > b) result = result.reverse();

  return [a, ...result, b];
}

function expandTokenPath(tokenPaths: TTokenPath[]): TCoordinate[] {
  const expandedPath: TCoordinate[] = [];
  for (let i = 0; i < tokenPaths.length; i++) {
    const path = tokenPaths[i] as TTokenPath;
    const isVertical = path.startCoords.x === path.endCoords.x;
    const staticCoordinateComponent = isVertical ? path.startCoords.x : path.startCoords.y;
    const variableStartCoordinate = isVertical ? path.startCoords.y : path.startCoords.x;
    const variableEndCoordinate = isVertical ? path.endCoords.y : path.endCoords.x;

    const variableCoordinates = getIntegersBetween(variableStartCoordinate, variableEndCoordinate);

    for (let j = 0; j < variableCoordinates.length; j++) {
      if (isVertical)
        expandedPath.push({
          x: staticCoordinateComponent,
          y: variableCoordinates[j],
        });
      else
        expandedPath.push({
          x: variableCoordinates[j],
          y: staticCoordinateComponent,
        });
    }
  }

  return expandedPath;
}

export const expandedTokenHomeEntryPath = Object.fromEntries(
  Object.entries(TOKEN_HOME_ENTRY_PATH).map(([key, value]) => [key, expandTokenPath([value])])
) as Record<TPlayerColour, TCoordinate[]>;

export const expandedGeneralTokenPath = expandTokenPath(GENERAL_TOKEN_PATH);

function genBlueTokenPath() {
  const expandedGeneralTokenPathForBlue = expandTokenPath(GENERAL_TOKEN_PATH).slice(0, -1);
  return [...expandedGeneralTokenPathForBlue, ...expandedTokenHomeEntryPath.blue];
}

function genRedTokenPath() {
  const path = [...GENERAL_TOKEN_PATH.slice(3), ...GENERAL_TOKEN_PATH.slice(0, 3)];
  const expandedTokenPathForRed = expandTokenPath(path).slice(0, -1);
  return [...expandedTokenPathForRed, ...expandedTokenHomeEntryPath.red];
}

function genGreenTokenPath() {
  const path = [...GENERAL_TOKEN_PATH.slice(6), ...GENERAL_TOKEN_PATH.slice(0, 6)];
  const expandedTokenPathForGreen = expandTokenPath(path).slice(0, -1);
  return [...expandedTokenPathForGreen, ...expandedTokenHomeEntryPath.green];
}

function genYellowTokenPath() {
  const path = [...GENERAL_TOKEN_PATH.slice(9), ...GENERAL_TOKEN_PATH.slice(0, 9)];
  const expandedTokenPathForYellow = expandTokenPath(path).slice(0, -1);
  return [...expandedTokenPathForYellow, ...expandedTokenHomeEntryPath.yellow];
}

const blueTokenPath = genBlueTokenPath();
const redTokenPath = genRedTokenPath();
const greenTokenPath = genGreenTokenPath();
const yellowTokenPath = genYellowTokenPath();

export const tokenPaths: Record<TPlayerColour, TCoordinate[]> = {
  blue: blueTokenPath,
  red: redTokenPath,
  green: greenTokenPath,
  yellow: yellowTokenPath,
};
