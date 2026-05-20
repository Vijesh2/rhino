type Result = "" | "H" | "D" | "A";

type Team = {
  team: string;
  pts: number;
  gd: number;
};

type Fixture = {
  home: string;
  away: string;
};

type Pick = {
  predicted: number;
  team: string;
};

type Player = "P" | "D" | "M" | "S" | "R";

const fixtures: Fixture[] = [
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

const baseTable: Team[] = [
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

const predictions: Record<Player, Pick[]> = {
  P: [
    { predicted: 1, team: "Liverpool" },
    { predicted: 2, team: "Arsenal" },
    { predicted: 3, team: "Manchester City" },
    { predicted: 4, team: "Chelsea" },
    { predicted: 5, team: "Manchester United" },
    { predicted: 6, team: "Aston Villa" },
    { predicted: 16, team: "Leeds United" },
    { predicted: 17, team: "Wolverhampton Wanderers" },
    { predicted: 18, team: "Brentford" },
    { predicted: 19, team: "Sunderland" },
    { predicted: 20, team: "Burnley" },
  ],
  D: [
    { predicted: 1, team: "Liverpool" },
    { predicted: 2, team: "Manchester City" },
    { predicted: 3, team: "Chelsea" },
    { predicted: 4, team: "Aston Villa" },
    { predicted: 5, team: "Arsenal" },
    { predicted: 6, team: "Newcastle United" },
    { predicted: 16, team: "Leeds United" },
    { predicted: 17, team: "Brentford" },
    { predicted: 18, team: "West Ham United" },
    { predicted: 19, team: "Sunderland" },
    { predicted: 20, team: "Burnley" },
  ],
  M: [
    { predicted: 1, team: "Manchester City" },
    { predicted: 2, team: "Chelsea" },
    { predicted: 3, team: "Arsenal" },
    { predicted: 4, team: "Liverpool" },
    { predicted: 5, team: "Aston Villa" },
    { predicted: 6, team: "Tottenham Hotspur" },
    { predicted: 16, team: "West Ham United" },
    { predicted: 17, team: "Leeds United" },
    { predicted: 18, team: "Wolverhampton Wanderers" },
    { predicted: 19, team: "Brentford" },
    { predicted: 20, team: "Burnley" },
  ],
  S: [
    { predicted: 1, team: "Manchester City" },
    { predicted: 2, team: "Liverpool" },
    { predicted: 3, team: "Chelsea" },
    { predicted: 4, team: "Arsenal" },
    { predicted: 5, team: "Sunderland" },
    { predicted: 6, team: "Aston Villa" },
    { predicted: 16, team: "AFC Bournemouth" },
    { predicted: 17, team: "Fulham" },
    { predicted: 18, team: "Brentford" },
    { predicted: 19, team: "West Ham United" },
    { predicted: 20, team: "Burnley" },
  ],
  R: [
    { predicted: 1, team: "Arsenal" },
    { predicted: 2, team: "Liverpool" },
    { predicted: 3, team: "Manchester City" },
    { predicted: 4, team: "Chelsea" },
    { predicted: 5, team: "Aston Villa" },
    { predicted: 6, team: "Tottenham Hotspur" },
    { predicted: 16, team: "Leeds United" },
    { predicted: 17, team: "Wolverhampton Wanderers" },
    { predicted: 18, team: "Brentford" },
    { predicted: 19, team: "Sunderland" },
    { predicted: 20, team: "Burnley" },
  ],
};
