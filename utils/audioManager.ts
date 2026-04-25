let currentPlayer: any = null;

export const setCurrentPlayer = (player: any) => {
  if (currentPlayer && currentPlayer !== player) {
    currentPlayer.pause(); 
  }

  currentPlayer = player;
};

export const clearCurrentPlayer = (player: any) => {
  if (currentPlayer === player) {
    currentPlayer = null;
  }
};