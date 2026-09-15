const axios = require("axios");
const fs = require("fs");
const md = require("markdown-it")({
  html: true, // Enable HTML tags in source
  breaks: false, // Convert '\n' in paragraphs into <br>
});

const TIMEZONE_OFFSET = 7;
const QUOTES_API = "https://zenquotes.io/api/quotes";

(async () => {
  const { today, hour } = getCurrentTime();
  const greetings = generateGreetings(hour);
  const { quote, author } = await getQuotes(hour);

  const text = `### ${greetings}
  <h2>I'm Michael, a Backend Engineer. <img src="https://media.giphy.com/media/mGcNjsfWAjY5AEZNw6/giphy.gif" width="50"></h2>

  ## <img src="https://emojis.slackmojis.com/emojis/images/1588315024/8823/hyperkitty.gif?1588315024" width="30" /> SKILL
  [<img align="right" width="50%" src="https://github-readme-stats.vercel.app/api?username=Kenini1805&show_icons=true&theme=synthwave">](https://metrics.lecoq.io/ouuan?template=classic)
  
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
  [<img align="right" width="50%" src="https://github-readme-stats.vercel.app/api/top-langs/?username=Kenini1805&show_icons=true&theme=synthwave&layout=compact">](https://metrics.lecoq.io/ouuan?template=classic)
  
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
  
  ## <img src="https://i.imgur.com/g4uAchW.gif" width="30" /> ABOUT ME
  💬 Ask me anything: [chillwithsu.com](https://chillwithsu.com/)
  ## Quote of the day:
  *"${quote}"* <br>
  — ${author}
  
  ⚡ Fun fact: ***No pain, no gain***
`;

  const content = md.renderInline(text);
  generateFile(content);

  /* Timestamp */
  console.log(`⏳ Running at ${today} UTC +0${TIMEZONE_OFFSET}:00`);
})();

function getCurrentTime() {
  const today = new Date();
  today.setHours(today.getHours() + TIMEZONE_OFFSET);
  const hour = today.getHours();
  const minute = today.getMinutes();
  // check if the hour >= 24
  if (hour >= 24) {
    return Math.abs(24 - hour);
  }
  return {
    today,
    hour,
    minute
  };
}

function isWeekend(date = getCurrentTime().today) {
  return date.getDay() === 6 || date.getDay() === 0;
}

function generateGreetings(time) {
  const goodMorning = "Good morning ☀️";
  const goodAfternoon = "Good afternoon 👋";
  const goodEvening = "Good evening ☕";
  const goodNight = "Good night 😴";
  const happyWeekend = "Happy weekend 🏝️";

  if (isWeekend()) {
    return happyWeekend;
  }
  if (time >= 4 && time < 11) {
    return goodMorning;
  }
  if (time >= 11 && time < 16) {
    return goodAfternoon;
  }
  if (time >= 16 && time < 23) {
    return goodEvening;
  }
  return goodNight;
}

async function getQuotes(time) {
    return await axios.get(QUOTES_API).then((response) => {
        if (response.data.length === 0) {
          return {
            quote: "There is no result without struggle, there is no struggle without sacrifice.",
            author: "Me",
          };
        }
        const { q, a } = response.data[0];
        return {
          quote: q,
          author: a,
        };
      });
}

function generateFile(contents) {
  const targetFile = "README.md";
  fs.writeFile(targetFile, contents, function (err) {
    if (err) return console.log(`⛔ [FAILED]: ${err}`);
    console.log("✅ [SUCCESS]: README.md has been generated.");
  });
}
