const fixtures = [
  { home: "Brighton & Hove Albion", away: "Manchester United" },
  { home: "Burnley", away: "Wolverhampton Wanderers" },
  { home: "Crystal Palace", away: "Arsenal" },
  { home: "Fulham", away: "Newcastle United" },
  { home: "Liverpool", away: "Brentford" },
  { home: "Manchester City", away: "Aston Villa" },
  { home: "Nottingham Forest", away: "AFC Bournemouth" },
  { home: "Sunderland", away: "Chelsea" },
  { home: "Tottenham Hotspur", away: "Everton" },
  { home: "West Ham United", away: "Leeds United" },
];

const baseTable = [
  { team: "Arsenal", pts: 82, gd: 43 },
  { team: "Manchester City", pts: 78, gd: 43 },
  { team: "Manchester United", pts: 68, gd: 16 },
  { team: "Aston Villa", pts: 62, gd: 6 },
  { team: "Liverpool", pts: 59, gd: 10 },
  { team: "AFC Bournemouth", pts: 56, gd: 4 },
  { team: "Brighton & Hove Albion", pts: 53, gd: 9 },
  { team: "Chelsea", pts: 52, gd: 7 },
  { team: "Brentford", pts: 52, gd: 3 },
  { team: "Sunderland", pts: 51, gd: -7 },
  { team: "Newcastle United", pts: 49, gd: 0 },
  { team: "Everton", pts: 49, gd: -2 },
  { team: "Fulham", pts: 49, gd: -6 },
  { team: "Leeds United", pts: 47, gd: -4 },
  { team: "Crystal Palace", pts: 45, gd: -9 },
  { team: "Nottingham Forest", pts: 43, gd: -3 },
  { team: "Tottenham Hotspur", pts: 38, gd: -10 },
  { team: "West Ham United", pts: 36, gd: -22 },
  { team: "Burnley", pts: 21, gd: -37 },
  { team: "Wolverhampton Wanderers", pts: 19, gd: -41 },
];

const predictions = {
  P: [
    [1, "Liverpool"], [2, "Arsenal"], [3, "Manchester City"], [4, "Chelsea"],
    [5, "Manchester United"], [6, "Aston Villa"], [16, "Leeds United"],
    [17, "Wolverhampton Wanderers"], [18, "Brentford"], [19, "Sunderland"], [20, "Burnley"],
  ],
  D: [
    [1, "Liverpool"], [2, "Manchester City"], [3, "Chelsea"], [4, "Aston Villa"],
    [5, "Arsenal"], [6, "Newcastle United"], [16, "Leeds United"],
    [17, "Brentford"], [18, "West Ham United"], [19, "Sunderland"], [20, "Burnley"],
  ],
  M: [
    [1, "Manchester City"], [2, "Chelsea"], [3, "Arsenal"], [4, "Liverpool"],
    [5, "Aston Villa"], [6, "Tottenham Hotspur"], [16, "West Ham United"],
    [17, "Leeds United"], [18, "Wolverhampton Wanderers"], [19, "Brentford"], [20, "Burnley"],
  ],
  S: [
    [1, "Manchester City"], [2, "Liverpool"], [3, "Chelsea"], [4, "Arsenal"],
    [5, "Sunderland"], [6, "Aston Villa"], [16, "AFC Bournemouth"],
    [17, "Fulham"], [18, "Brentford"], [19, "West Ham United"], [20, "Burnley"],
  ],
  R: [
    [1, "Arsenal"], [2, "Liverpool"], [3, "Manchester City"], [4, "Chelsea"],
    [5, "Aston Villa"], [6, "Tottenham Hotspur"], [16, "Leeds United"],
    [17, "Wolverhampton Wanderers"], [18, "Brentford"], [19, "Sunderland"], [20, "Burnley"],
  ],
};

const playerOrder = ["P", "D", "M", "S", "R"];

const playerNames = {
  P: "Crypto",
  D: "HeMan",
  M: "Bapuji",
  S: "Nige",
  R: "Rocket",
};

const state = new Array(fixtures.length).fill("");

function cloneTable() {
  return new Map(baseTable.map((team) => [team.team, { ...team }]));
}

function orderedTable() {
  const table = cloneTable();
  state.forEach((result, index) => {
    const fixture = fixtures[index];
    const home = table.get(fixture.home);
    const away = table.get(fixture.away);
    if (!home || !away) return;
    if (result === "H") {
      home.pts += 3;
      home.gd += 1;
      away.gd -= 1;
    } else if (result === "A") {
      away.pts += 3;
      away.gd += 1;
      home.gd -= 1;
    } else if (result === "D") {
      home.pts += 1;
      away.pts += 1;
    }
  });
  return Array.from(table.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return a.team.localeCompare(b.team);
  });
}

function scorePlayers(table) {
  const positions = new Map(table.map((team, index) => [team.team, index + 1]));
  return Object.entries(predictions)
    .map(([player, picks]) => {
      const score = picks.reduce((total, [predicted, team]) => {
        return total + Math.abs(predicted - positions.get(team));
      }, 0);
      return { player, score };
    })
    .sort((a, b) => {
      return a.score - b.score || playerOrder.indexOf(a.player) - playerOrder.indexOf(b.player);
    });
}

function renderFixtures(root) {
  root.innerHTML = fixtures.map((fixture, index) => `
    <div class="fixture">
      <div class="fixture__teams">
        <strong>${fixture.home} v ${fixture.away}</strong>
        <span>16:00, Sunday 24 May</span>
      </div>
      <div class="fixture__choices" aria-label="${fixture.home} versus ${fixture.away}">
        <button type="button" data-index="${index}" data-result="H" aria-pressed="false">H</button>
        <button type="button" data-index="${index}" data-result="D" aria-pressed="false">D</button>
        <button type="button" data-index="${index}" data-result="A" aria-pressed="false">A</button>
      </div>
    </div>
  `).join("");
}

function render() {
  const table = orderedTable();
  const leaderboard = scorePlayers(table);
  const leaderboardRoot = document.querySelector("[data-role='leaderboard']");
  const topRoot = document.querySelector("[data-role='top-six']");
  const bottomRoot = document.querySelector("[data-role='bottom-five']");
  if (!leaderboardRoot || !topRoot || !bottomRoot) return;

  leaderboardRoot.innerHTML = leaderboard.map((row, index) => `
    <div class="leader-row">
      <span>${index + 1}</span>
      <b>${playerNames[row.player]}</b>
      <strong>${row.score}</strong>
    </div>
  `).join("");
  topRoot.innerHTML = table.slice(0, 6).map((team) => `<li>${team.team}</li>`).join("");
  bottomRoot.innerHTML = table.slice(-5).map((team) => `<li>${team.team}</li>`).join("");

  document.querySelectorAll("[data-index][data-result]").forEach((button) => {
    const index = Number(button.dataset.index);
    button.setAttribute("aria-pressed", String(state[index] === button.dataset.result));
  });
}

function setPreset(code) {
  code.split("").forEach((result, index) => {
    state[index] = result;
  });
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  const fixtureRoot = document.querySelector("[data-role='fixtures']");
  if (!fixtureRoot) return;
  renderFixtures(fixtureRoot);
  render();

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const resultButton = target.closest("[data-index][data-result]");
    if (resultButton instanceof HTMLElement) {
      const index = Number(resultButton.dataset.index);
      const result = resultButton.dataset.result || "";
      state[index] = state[index] === result ? "" : result;
      render();
      return;
    }
    const preset = target.closest("[data-preset]");
    if (preset instanceof HTMLElement && preset.dataset.preset) {
      setPreset(preset.dataset.preset);
      return;
    }
    if (target.closest("[data-action='reset']")) {
      state.fill("");
      render();
    }
  });
});
