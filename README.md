# GitHub LOC (Lines of Code) by Language

This project provides a script to calculate the lines of code (LOC) added and removed by two GitHub usernames across various repositories, split by programming language.

## Prerequisites

- **GitHub CLI (gh):** Ensure the GitHub CLI is installed and authenticated.
- **Bash:** Ensure your environment has Bash installed (preferably version 4 or higher).

## Installation

1. Clone the Repository:
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```
2. Ensure GitHub CLI is Installed:
   Install the GitHub CLI by following the instructions here.
3. Authenticate GitHub CLI:
   Authenticate your GitHub CLI with: `gh auth login`

## Usage

1. Update the Script:
   - Replace aliharriss in the script with your previous GitHub username if applicable.
   - Ensure contributed-repos.txt is filled with the URLs of the repositories you have contributed to, one per line.
2. Make the Script Executable:
   ```bash
   chmod +x contributions-by-language.sh
   ```
3. Run the Script:
   ```bash
   ./contributions-by-language.sh
   ```
