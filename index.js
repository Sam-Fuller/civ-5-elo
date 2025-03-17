function createPlayerCard(player, index) {
	const card = document.createElement('div');
	card.className = 'player-card';
	card.innerHTML = `
		<div class="player-card-header">
			<h2>${player.player}</h2>
			<h3>${player.elo.toFixed(0)}</h3>
		</div>
		<div class="player-card-body">
			<p>Games: ${player.games}</p>
			<p>Wins: ${player.wins}</p>
			<p>Average position: ${(player.position / player.games).toFixed(2)}</p>
		</div>
	`;
	return card;
}

async function displayRankings() {
	const response = await fetch('elo.json');
	const data = await response.json();

	data.sort((a, b) => b.elo - a.elo);

	const container = document.getElementById('rankingContainer');
	console.log("container", container);

	data.forEach((player, index) => {
		const card = createPlayerCard(player, index);
		container.appendChild(card);
	});
}

displayRankings();

function gamePlayerCard(player) {
	eloChange = player.eloChange.toFixed(0);
	isPositive = eloChange > 0;
	eloChange = (player.eloChange > 0 ? '+' : '') + eloChange;

	const card = `
		<div class="game-player-card">
			<h3>${player.rank}. ${player.name}</h3>
			<div class="game-player-card-body">
				<p>${player.currentElo}&nbsp</p> 
				<p class="elo-change-${isPositive}">(${eloChange})</p></div>
		</div>
	`

	return card;
}


async function displayGameResults() {
	const response = await fetch('games.json');
	const games = await response.json();

	const gameResultsContainer = document.getElementById('gameResultsContainer');

	games.forEach((game, index) => {
		const winner = game.players.find(player => player.rank === 1).name || "Draw";

		const gameCard = document.createElement('div');
		gameCard.className = 'game-card';
		gameCard.innerHTML = `
			<div class="game-card-header">
				<h2>Winner: ${winner}</h2>
				<h3>${new Date(game.date).toLocaleDateString()}</h3>
			</div>
			<div class="game-card-body">
				${game.players.map(gamePlayerCard).reduce((a, b) => a + b)}
			</div>
		`;
		(gameResultsContainer.firstChild) ? gameResultsContainer.insertBefore(gameCard, gameResultsContainer.firstChild) : gameResultsContainer.appendChild(gameCard);
	});
}

displayGameResults();
