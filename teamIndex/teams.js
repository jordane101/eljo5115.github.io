/* Static league/team reference data for Team Index.
   Never fetched — teams don't change often enough to justify a request. */

const TI_LEAGUES = {
    nba: {
        label: 'NBA',
        divisions: {
            'Atlantic': [
                { code: 'BOS', name: 'Boston Celtics' },
                { code: 'BKN', name: 'Brooklyn Nets' },
                { code: 'NYK', name: 'New York Knicks' },
                { code: 'PHI', name: 'Philadelphia 76ers' },
                { code: 'TOR', name: 'Toronto Raptors' }
            ],
            'Central': [
                { code: 'CHI', name: 'Chicago Bulls' },
                { code: 'CLE', name: 'Cleveland Cavaliers' },
                { code: 'DET', name: 'Detroit Pistons' },
                { code: 'IND', name: 'Indiana Pacers' },
                { code: 'MIL', name: 'Milwaukee Bucks' }
            ],
            'Southeast': [
                { code: 'ATL', name: 'Atlanta Hawks' },
                { code: 'CHA', name: 'Charlotte Hornets' },
                { code: 'MIA', name: 'Miami Heat' },
                { code: 'ORL', name: 'Orlando Magic' },
                { code: 'WAS', name: 'Washington Wizards' }
            ],
            'Northwest': [
                { code: 'DEN', name: 'Denver Nuggets' },
                { code: 'MIN', name: 'Minnesota Timberwolves' },
                { code: 'OKC', name: 'Oklahoma City Thunder' },
                { code: 'POR', name: 'Portland Trail Blazers' },
                { code: 'UTA', name: 'Utah Jazz' }
            ],
            'Pacific': [
                { code: 'GSW', name: 'Golden State Warriors' },
                { code: 'LAC', name: 'LA Clippers' },
                { code: 'LAL', name: 'Los Angeles Lakers' },
                { code: 'PHX', name: 'Phoenix Suns' },
                { code: 'SAC', name: 'Sacramento Kings' }
            ],
            'Southwest': [
                { code: 'DAL', name: 'Dallas Mavericks' },
                { code: 'HOU', name: 'Houston Rockets' },
                { code: 'MEM', name: 'Memphis Grizzlies' },
                { code: 'NOP', name: 'New Orleans Pelicans' },
                { code: 'SAS', name: 'San Antonio Spurs' }
            ]
        }
    },
    nfl: {
        label: 'NFL',
        divisions: {
            'AFC East': [
                { code: 'BUF', name: 'Buffalo Bills' },
                { code: 'MIA', name: 'Miami Dolphins' },
                { code: 'NE', name: 'New England Patriots' },
                { code: 'NYJ', name: 'New York Jets' }
            ],
            'AFC North': [
                { code: 'BAL', name: 'Baltimore Ravens' },
                { code: 'CIN', name: 'Cincinnati Bengals' },
                { code: 'CLE', name: 'Cleveland Browns' },
                { code: 'PIT', name: 'Pittsburgh Steelers' }
            ],
            'AFC South': [
                { code: 'HOU', name: 'Houston Texans' },
                { code: 'IND', name: 'Indianapolis Colts' },
                { code: 'JAX', name: 'Jacksonville Jaguars' },
                { code: 'TEN', name: 'Tennessee Titans' }
            ],
            'AFC West': [
                { code: 'DEN', name: 'Denver Broncos' },
                { code: 'KC', name: 'Kansas City Chiefs' },
                { code: 'LV', name: 'Las Vegas Raiders' },
                { code: 'LAC', name: 'Los Angeles Chargers' }
            ],
            'NFC East': [
                { code: 'DAL', name: 'Dallas Cowboys' },
                { code: 'NYG', name: 'New York Giants' },
                { code: 'PHI', name: 'Philadelphia Eagles' },
                { code: 'WAS', name: 'Washington Commanders' }
            ],
            'NFC North': [
                { code: 'CHI', name: 'Chicago Bears' },
                { code: 'DET', name: 'Detroit Lions' },
                { code: 'GB', name: 'Green Bay Packers' },
                { code: 'MIN', name: 'Minnesota Vikings' }
            ],
            'NFC South': [
                { code: 'ATL', name: 'Atlanta Falcons' },
                { code: 'CAR', name: 'Carolina Panthers' },
                { code: 'NO', name: 'New Orleans Saints' },
                { code: 'TB', name: 'Tampa Bay Buccaneers' }
            ],
            'NFC West': [
                { code: 'ARI', name: 'Arizona Cardinals' },
                { code: 'LAR', name: 'Los Angeles Rams' },
                { code: 'SF', name: 'San Francisco 49ers' },
                { code: 'SEA', name: 'Seattle Seahawks' }
            ]
        }
    },
    mlb: {
        label: 'MLB',
        divisions: {
            'AL East': [
                { code: 'BAL', name: 'Baltimore Orioles' },
                { code: 'BOS', name: 'Boston Red Sox' },
                { code: 'NYY', name: 'New York Yankees' },
                { code: 'TB', name: 'Tampa Bay Rays' },
                { code: 'TOR', name: 'Toronto Blue Jays' }
            ],
            'AL Central': [
                { code: 'CWS', name: 'Chicago White Sox' },
                { code: 'CLE', name: 'Cleveland Guardians' },
                { code: 'DET', name: 'Detroit Tigers' },
                { code: 'KC', name: 'Kansas City Royals' },
                { code: 'MIN', name: 'Minnesota Twins' }
            ],
            'AL West': [
                { code: 'ATH', name: 'Athletics' },
                { code: 'HOU', name: 'Houston Astros' },
                { code: 'LAA', name: 'Los Angeles Angels' },
                { code: 'SEA', name: 'Seattle Mariners' },
                { code: 'TEX', name: 'Texas Rangers' }
            ],
            'NL East': [
                { code: 'ATL', name: 'Atlanta Braves' },
                { code: 'MIA', name: 'Miami Marlins' },
                { code: 'NYM', name: 'New York Mets' },
                { code: 'PHI', name: 'Philadelphia Phillies' },
                { code: 'WSH', name: 'Washington Nationals' }
            ],
            'NL Central': [
                { code: 'CHC', name: 'Chicago Cubs' },
                { code: 'CIN', name: 'Cincinnati Reds' },
                { code: 'MIL', name: 'Milwaukee Brewers' },
                { code: 'PIT', name: 'Pittsburgh Pirates' },
                { code: 'STL', name: 'St. Louis Cardinals' }
            ],
            'NL West': [
                { code: 'ARI', name: 'Arizona Diamondbacks' },
                { code: 'COL', name: 'Colorado Rockies' },
                { code: 'LAD', name: 'Los Angeles Dodgers' },
                { code: 'SD', name: 'San Diego Padres' },
                { code: 'SF', name: 'San Francisco Giants' }
            ]
        }
    }
};

/* Flat lookup helpers */
function tiAllTeams(league) {
    const l = TI_LEAGUES[league];
    if (!l) return [];
    return Object.values(l.divisions).flat();
}

function tiFindTeam(league, code) {
    return tiAllTeams(league).find(t => t.code === code) || null;
}
