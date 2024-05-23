import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import {
  commitSHAsToSkip,
  contributedRepos,
  filePathsToSkip,
  languageExtensionMap,
  usernames,
} from "./constants";

type LOCByLanguage = Record<string, { additions: number; deletions: number }>;

// Initialize Octokit
dotenv.config();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Function to get repository languages
async function getRepoLanguages(owner: string, repo: string) {
  const { data } = await octokit.repos.listLanguages({ owner, repo });
  return Object.keys(data);
}

async function fetchAllCommits(owner: string, repo: string, user: string) {
  let commits: string[] = [];
  let page = 1;
  let response;

  let hasMoreCommits = true;
  do {
    response = await octokit.repos.listCommits({
      owner,
      repo,
      author: user,
      per_page: 100,
      page,
    });

    commits = commits.concat(response.data.map((commit) => commit.sha));
    page++;

    if (response.data.length === 0) {
      hasMoreCommits = false;
    }
  } while (hasMoreCommits);

  return commits;
}

// Function to get commits by user
async function getCommits(owner: string, repo: string, usernames: string[]) {
  const allCommits = await Promise.all(
    usernames.map(async (user) => await fetchAllCommits(owner, repo, user))
  );

  const filteredCommits = allCommits.flat().filter((sha) => {
    if (!commitSHAsToSkip.includes(sha)) {
      return true;
    }
    console.log(`Skipping commit ${sha}`);
    return false;
  });
  console.log(`Total commits: ${filteredCommits.length}`);
  return filteredCommits;
}

// Function to get commit details
async function getCommitDetails(owner: string, repo: string, sha: string) {
  const { data } = await octokit.repos.getCommit({ owner, repo, ref: sha });
  return data.files;
}

// Function to process a repository and calculate LOC
async function processRepo(owner: string, repo: string, usernames: string[]) {
  const languages = await getRepoLanguages(owner, repo);
  const commits = await getCommits(owner, repo, usernames);

  const locByLanguage: LOCByLanguage = {};

  for (const sha of commits) {
    const files = await getCommitDetails(owner, repo, sha);
    files?.forEach((file) => {
      const filename = file.filename;
      // Skip files based on file paths
      if (filePathsToSkip.some((path) => filename.includes(path))) {
        return;
      }

      const additions = file.additions;
      const deletions = file.deletions;

      for (const lang of languages) {
        if (lang === "Dockerfile" && filename === "Dockerfile") {
          if (!locByLanguage[lang]) {
            locByLanguage[lang] = { additions: 0, deletions: 0 };
          }
          locByLanguage[lang].additions += additions;
          locByLanguage[lang].deletions += deletions;
        } else {
          const exts = languageExtensionMap[lang];
          if (exts && exts.some((ext) => filename.endsWith(`.${ext}`))) {
            if (!locByLanguage[lang]) {
              locByLanguage[lang] = { additions: 0, deletions: 0 };
            }
            locByLanguage[lang].additions += additions;
            locByLanguage[lang].deletions += deletions;
          }
        }
      }
    });
  }

  return locByLanguage;
}

// Main function
async function main() {
  const totalLocByLanguage: {
    [key: string]: { additions: number; deletions: number };
  } = {};

  for (const repoUrl of contributedRepos) {
    console.log(repoUrl);
    const [owner, repo] = repoUrl.replace("https://github.com/", "").split("/");
    const locByLanguage = await processRepo(owner, repo, usernames);

    for (const [lang, loc] of Object.entries(locByLanguage)) {
      if (!totalLocByLanguage[lang]) {
        totalLocByLanguage[lang] = { additions: 0, deletions: 0 };
      }
      totalLocByLanguage[lang].additions += loc.additions;
      totalLocByLanguage[lang].deletions += loc.deletions;
    }
  }

  const outputPath = path.join(__dirname, "loc-output.json");
  fs.writeFileSync(outputPath, JSON.stringify(totalLocByLanguage, null, 2));

  console.log(`LOC data has been saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
