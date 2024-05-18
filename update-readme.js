const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function getMostUsedLanguages(username) {
  const repos = await octokit.repos.listForUser({
    username,
    per_page: 100,
  });

  const languages = {};

  for (const repo of repos.data) {
    const { data: repoLanguages } = await octokit.repos.listLanguages({
      owner: username,
      repo: repo.name,
    });

    for (const [language, lines] of Object.entries(repoLanguages)) {
      languages[language] = (languages[language] || 0) + lines;
    }
  }

  const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  return sortedLanguages.slice(0, 5).map(([language]) => language);
}

async function updateReadme() {
  const username = "YOUR_GITHUB_USERNAME"; // replace with your GitHub username
  const languages = await getMostUsedLanguages(username);

  let readmeContent = fs.readFileSync("README.md", "utf8");

  const languagesSection = `
## 📊 Most Used Languages

${languages.map(lang => `- **${lang}**`).join("\n")}
`;

  readmeContent = readmeContent.replace(
    /## 📊 Most Used Languages[\s\S]*?(?=\n#|$)/,
    languagesSection
  );

  fs.writeFileSync("README.md", readmeContent);
}

updateReadme();
