const axios = require("axios");
const fs = require("fs");

const TIMEZONE_OFFSET = 7;
const QUOTES_API = "https://zenquotes.io/api/quotes";
const GITHUB_USERNAME = "TuansHuynh";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const TOP_REPOS_COUNT = 4;

(async () => {
  const { today, hour } = getCurrentTime();
  const greetings = generateGreetings(hour);
  const { quote, author } = await getQuotes();
  const repos = await fetchTopRepos();

  const reposTable = buildReposTable(repos);

  const text = `### ${greetings}

<h2>I'm Tuan Huynh, a Full Stack Developer. <img src="https://media.giphy.com/media/mGcNjsfWAjY5AEZNw6/giphy.gif" width="50"></h2>

## <img src="https://emojis.slackmojis.com/emojis/images/1588315024/8823/hyperkitty.gif?1588315024" width="30" /> SKILL
[<img align="right" width="50%" src="https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=synthwave">](https://metrics.lecoq.io/ouuan?template=classic)

- Understands \`OOP\` well
- \`HTML\`, \`CSS\`, \`Bootstrap\`: proficient
- Strong skills in \`JQuery\`, \`MySQL\`, \`PHP\`
- Excellent with the \`Laravel\` framework for web design
- Proficient with \`Git\`
- Learning the \`Agile\` mindset
- Knowledge of \`Vue.js\` and \`Vuex\`
- Skill in \`Unit Testing\`
- Experience in manual and \`automated deployment\`
- Familiar with \`AWS\`

## <img src="https://emojis.slackmojis.com/emojis/images/1643515721/17468/homersimpson-pbjdance.gif?1643515721" width="30" /> CERTIFICATES
<img src="https://images.viblo.asia/1f5d99d1-8cb7-4d82-a627-d6934d20d94b.png" width="100" />

## <img src="https://images.viblo.asia/a22cc9ed-e446-4eae-ad55-1ddf8afbaa54.gif" width="30" /> CONTRIBUTIONS
[<img align="right" width="50%" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&show_icons=true&theme=synthwave&layout=compact">](https://metrics.lecoq.io/ouuan?template=classic)

#### 06/2020
**Contributor at Laravel**: 
- https://github.com/laravel/framework/pull/33278
- https://github.com/laravel/framework/pull/49669

#### 2019
**Contributor at Chat++**: 
- https://github.com/wataridori/chatpp/graphs/contributors

#### Present
Owner of packages \`Laravel monitoring\` and \`Nginx monitoring\`
- https://github.com/AvengersCodeLovers/laravel-log-monitoring
- https://github.com/AvengersCodeLovers/nginx-log-monitoring

## 📂 MY PROJECTS

> 🔄 *Auto-updated: ${today.toISOString().slice(0, 10)}*

${reposTable}

## <img src="https://i.imgur.com/g4uAchW.gif" width="30" /> ABOUT ME
💬 Ask me anything: [chillwithsu.com](https://chillwithsu.com/)

## Quote of the day:
*"${quote}"* <br>
— ${author}

⚡ Fun fact: ***No pain, no gain***
`;

  generateFile(text);

  /* Timestamp */
  console.log(`⏳ Running at ${today} UTC +0${TIMEZONE_OFFSET}:00`);
})();

// ─── Helpers ────────────────────────────────────────────────

function getCurrentTime() {
  const today = new Date();
  today.setHours(today.getHours() + TIMEZONE_OFFSET);
  const hour = today.getHours();
  if (hour >= 24) {
    return { today, hour: Math.abs(24 - hour), minute: 0 };
  }
  return { today, hour, minute: today.getMinutes() };
}

function isWeekend(date = getCurrentTime().today) {
  return date.getDay() === 6 || date.getDay() === 0;
}

function generateGreetings(time) {
  const goodMorning   = "Good morning ☀️";
  const goodAfternoon = "Good afternoon 👋";
  const goodEvening   = "Good evening ☕";
  const goodNight     = "Good night 😴";
  const happyWeekend  = "Happy weekend 🏝️";

  if (isWeekend()) return happyWeekend;
  if (time >= 4  && time < 11) return goodMorning;
  if (time >= 11 && time < 16) return goodAfternoon;
  if (time >= 16 && time < 23) return goodEvening;
  return goodNight;
}

async function getQuotes() {
  try {
    const response = await axios.get(QUOTES_API);
    if (!response.data || response.data.length === 0) {
      return { quote: "There is no result without struggle.", author: "Me" };
    }
    const { q, a } = response.data[0];
    return { quote: q, author: a };
  } catch (err) {
    console.warn("⚠️ Could not fetch quote:", err.message);
    return { quote: "Keep pushing forward.", author: "Me" };
  }
}

/**
 * Fetch top N repos sorted by most recently pushed (active).
 * Excludes forks. Uses GITHUB_TOKEN env var if available to avoid rate limiting.
 */
async function fetchTopRepos() {
  try {
    const headers = { "User-Agent": GITHUB_USERNAME };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch up to 100 repos, then filter & sort client-side
    const response = await axios.get(GITHUB_API, {
      headers,
      params: {
        per_page: 100,
        sort: "pushed",
        direction: "desc",
        type: "owner",
      },
    });

    const repos = response.data
      .filter((r) => !r.fork && !r.archived) // exclude forks & archived
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, TOP_REPOS_COUNT);

    return repos;
  } catch (err) {
    console.warn("⚠️ Could not fetch repos:", err.message);
    return [];
  }
}

/**
 * Build a Markdown table from repos array.
 */
function buildReposTable(repos) {
  if (!repos || repos.length === 0) {
    return "_No public repositories found._";
  }

  const header = `| Repository | Description | Language | ⭐ Stars | 🍴 Forks |
|:-----------|:------------|:--------:|--------:|---------:|`;

  const rows = repos.map((repo) => {
    const name = `[${repo.name}](${repo.html_url})`;
    const desc = repo.description
      ? repo.description.replace(/\|/g, "\\|").slice(0, 60) + (repo.description.length > 60 ? "…" : "")
      : "_No description_";
    const lang = repo.language || "—";
    const stars = repo.stargazers_count ?? 0;
    const forks = repo.forks_count ?? 0;
    return `| ${name} | ${desc} | ${lang} | ${stars} | ${forks} |`;
  });

  return [header, ...rows].join("\n");
}

function generateFile(contents) {
  const targetFile = "README.md";
  fs.writeFile(targetFile, contents, function (err) {
    if (err) return console.log(`⛔ [FAILED]: ${err}`);
    console.log("✅ [SUCCESS]: README.md has been generated.");
  });
}
