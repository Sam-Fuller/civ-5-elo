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
	game.players.sort((a, b) => {
		if (a.rank === b.rank) {
			const aElo = currentElos.find(elo => elo.player === a.name)?.elo || START_ELO;
			const bElo = currentElos.find(elo => elo.player === b.name)?.elo || START_ELO;
			return bElo - aElo;
		}
		return a.rank - b.rank;
	});

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
	const averageRank = game.players.reduce((a, b) => a + b.rank, 0) / playerCount;

	const totalElo = game.players
		.map(player => currentElos.find(elo => elo.player === player.name)?.elo || START_ELO)
		.reduce((a, b) => a + b, 0);
	
	const averageElo = totalElo / playerCount;

	game.players.forEach(player => {
		const currentElo = currentElos.find(elo => elo.player === player.name);


		const comparativeRank =  -(-1 + (player.rank - 1) / (averageRank - 1));
		
		const eloMultiplier = averageElo / currentElo.elo;
		const eloMultiplierFixed = comparativeRank > 0 ? eloMultiplier : 1/eloMultiplier;
		const eloChange = ELO_RATE * comparativeRank * eloMultiplierFixed;
		
		currentElo.elo += eloChange;
		player.eloChange = eloChange;
		player.currentElo = currentElo.elo;

		currentElo.games++;
		currentElo.wins += player.rank === 1 ? 1 : 0;

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