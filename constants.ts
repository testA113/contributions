// Replace with your GitHub username(s)
export const usernames = ["testa113", "aliharriss"];

// List of commit SHAs to skip - e.g. commits when adding starter project files
export const commitSHAsToSkip = [
  "c5a6488d680ff5a48e6fff2dc328c0745b742447", // tenancyhelp
  "d9d890cf90e87c985786378df9c483aed993b31c", // tenancyhelp downloaded html
  "8b41c042af44489d2aae7b6cea57e3efeb697bdd", // spiritofmixology
  "48f99d7242eee9e517c92e8f39f6571973484311", // alchemist
];

// List of file paths to ignore - e.g. third-party libraries, build files
export const filePathsToSkip = [
  "node_modules/",
  "vendor/",
  "public/",
  "dist/",
  "build/",
  "webpack/",
];

// Define the list of languages and their file extensions
export const languageExtensionMap: Record<string, string[]> = {
  Dockerfile: ["Dockerfile"],
  JavaScript: ["js", "jsx"],
  TypeScript: ["ts", "tsx"],
  Shell: ["sh"],
  CSS: ["css"],
  HTML: ["html"],
  Python: ["py"],
  Go: ["go"],
  // Add more languages here if needed
};

export const contributedRepos = [
  "https://github.com/portainer/portainer-ee",
  "https://github.com/testA113/tenancyhelp",
  "https://github.com/testA113/spiritofmixology",
  "https://github.com/testA113/alchemist",
  "https://github.com/aliharriss/surf-scout",
];
