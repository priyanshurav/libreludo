export const ERRORS = {
  boardDoesNotExist: () => 'The board does not exist',
  invalidNumberOfPlayers: () => 'Number of player can only be either two, three or four',
  playerDoesNotExist: (playerColour: string) => `Player with colour ${playerColour} does not exist`,
  playerAlreadyExists: (playerColour: string) =>
    `Player with colour ${playerColour} already exists`,
  tokenDoesNotExist: (playerColour: string, id: number) =>
    `Token with colour ${playerColour} and ID ${id} does not exist`,
  invalidPlayerColour: (playerColour: string) => `${playerColour} is not a valid player colour`,
  diceDoesNotExist: (playerColour: string) =>
    `Dice associated with player of player colour ${playerColour} does not exist`,
  invalidDiceNumber: (diceNumber: string) => `${diceNumber} is not a valid dice number`,
  lockedToken: (playerColour: string, id: number) =>
    `Token with colour ${playerColour} and ID ${id} is locked`,
  tokenAlreadyLocked: (playerColour: string, id: number) =>
    `Token with colour ${playerColour} and ID ${id} is already locked`,
  tokenAlreadyUnlocked: (playerColour: string, id: number) =>
    `Token with colour ${playerColour} and ID ${id} is already unlocked`,
  numberOfStepsNegative: () => `Number of steps cannot be negative`,
};
