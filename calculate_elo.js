const fs = require('fs');

const START_ELO = 1000;
const SETTLED_ELO = 1500;
const SETTLING_RATE = 0.2;

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

function getSettlingElo(gameNumber) {
	const currentElo = START_ELO + (SETTLED_ELO - START_ELO) * (1 - Math.exp(-SETTLING_RATE * gameNumber));
    const previousElo = START_ELO + (SETTLED_ELO - START_ELO) * (1 - Math.exp(-SETTLING_RATE * (gameNumber - 1)))
    const settlingElo = currentElo - previousElo
    return settlingElo
}

function updateEloForGame(game, currentElos) {
	game.players.forEach(player => {
		if (!currentElos.find(elo => elo.player === player.name)) {
			currentElos.push({
				player: player.name,
				elo: START_ELO,
				games: 0,
			});
		}
	});

	const playerCount = game.players.length;

	const totalElo = game.players
		.map(player => currentElos.find(elo => elo.player === player.name)?.elo || START_ELO)
		.reduce((a, b) => a + b, 0);
	
	const averageElo = totalElo / playerCount;

	game.players.forEach(player => {
		const currentElo = currentElos.find(elo => elo.player === player.name);

		currentElo.games++;

		const comparativeRank =  -(-1 + 2 * (player.rank - 1) / (playerCount - 1));


		const eloMultiplier = averageElo / currentElo.elo;


		const settlingElo = getSettlingElo(currentElo.games);


		const eloChange = ELO_RATE * comparativeRank * eloMultiplier + settlingElo;

		currentElo.elo += eloChange;
		player.eloChange = eloChange;
		
		console.log(player.name, player.rank, comparativeRank, currentElo.elo, eloChange, settlingElo);
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