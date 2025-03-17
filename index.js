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
			<div class="icon-container">
				${player.rank === 1 ? '<img src="win-icons/crown.svg" alt="winner" width="25" height="25" title="Winner">' : ""}
				<img class="small-icon" src="civ-icons/${player.civ}.webp" alt="${player.civ}" title="${player.civ}">
				<h3>&nbsp${player.name}</h3>
			</div>
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

	games.forEach(game => {
		const winner = game.players.find(player => player.rank === 1).name;
		const winningCiv = game.players.find(player => player.rank === 1).civ;

		const gameCard = document.createElement('div');
		gameCard.className = 'game-card';
		gameCard.innerHTML = `
			<div class="game-card-header">
				<div class="icon-container">
					<img src="win-icons/crown.svg" alt="winner" width="35" height="35" title="Winner">
					<img class="icon" src="win-icons/${game.victoryType}.webp" alt="${game.victoryType}" title="${game.victoryType}">
					<img class="icon" src="civ-icons/${winningCiv}.webp" alt="${winningCiv} title="${winningCiv}"">
					<h2>&nbsp${winner}</h2>
				</div>
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
