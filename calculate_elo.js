const fs = require('fs');

const START_ELO = 1500;

const ELO_RATE = 32;

async function readGames() {
	try {
		const data = await fs.promises.readFile('games.json', 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading games.json:', error);
		throw error;
	}
}
function updateEloForGame(game, currentElos) {
	// Sort players by rank, and if ranks are equal, sort by their current ELO in descending order
	game.players.sort((a, b) => {
		if (a.rank === b.rank) {
			const aElo = currentElos.find(elo => elo.player === a.name)?.elo || START_ELO;
			const bElo = currentElos.find(elo => elo.player === b.name)?.elo || START_ELO;
			return bElo - aElo;
		}
		return a.rank - b.rank;
	});

	// Initialize ELO for players who don't already have an entry in currentElos
	game.players.forEach(player => {
		if (!currentElos.find(elo => elo.player === player.name)) {
			currentElos.push({
				player: player.name,
				elo: START_ELO,
				games: 0,
				wins: 0
			});
		}
	});

	const playerCount = game.players.length;

	// Calculate the average rank of all players in the game
	const averageRank = game.players.reduce((a, b) => a + b.rank, 0) / playerCount;

	// Calculate the total and average ELO of all players in the game
	const totalElo = game.players
		.map(player => currentElos.find(elo => elo.player === player.name)?.elo || START_ELO)
		.reduce((a, b) => a + b, 0);
	const averageElo = totalElo / playerCount;

	// Update ELO for each player based on their rank and the average ELO
	game.players.forEach(player => {
		const currentElo = currentElos.find(elo => elo.player === player.name);

		// Calculate comparative rank as a normalized value between -1 and 1
		const comparativeRank = -(-1 + (player.rank - 1) / (averageRank - 1));

		// Calculate ELO multiplier based on the player's current ELO and the average ELO
		const eloMultiplier = averageElo / currentElo.elo;

		// Adjust the multiplier based on whether the comparative rank is positive or negative
		const eloMultiplierFixed = comparativeRank > 0 ? eloMultiplier : 1 / eloMultiplier;

		// Calculate the ELO change for the player
		const eloChange = ELO_RATE * comparativeRank * eloMultiplierFixed;

		// Update the player's ELO and add the change to the game data
		currentElo.elo += eloChange;
		player.eloChange = eloChange;
		player.currentElo = currentElo.elo;

		// Increment the player's game count and win count if they ranked first
		currentElo.games++;
		currentElo.wins += player.rank === 1 ? 1 : 0;

		// Log debug information for the ELO calculation
		console.log("eloMultiplier", eloMultiplierFixed, currentElo, averageElo, player.name);
	});
}

async function calculateElo() {
	const games = await readGames();

	const elos = [];

	games.forEach(game => {
		updateEloForGame(game, elos);
	});

	console.log(elos);

	await fs.promises.writeFile('elo.json', JSON.stringify(elos, null, 2), 'utf8');
	await fs.promises.writeFile('games.json', JSON.stringify(games, null, 2), 'utf8');
}

calculateElo();