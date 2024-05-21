#!/bin/bash

# Ensure GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Get the authenticated user's current and previous usernames
current_username=$(gh api user --jq '.login')
previous_username="aliharriss"  # Replace with your previous username

# Check if the current username was successfully retrieved
if [ -z "$current_username" ]; then
    echo "Failed to retrieve current GitHub username. Make sure you are authenticated."
    exit 1
fi

# Define a list of languages and their file extensions
languages_list=("Dockerfile:Dockerfile" "JavaScript:js jsx" "TypeScript:ts tsx" "Shell:sh" "CSS:css" "HTML:html" "Python:py" "Ruby:rb" "Java:java" "C:c" "C++:cpp" "C#:cs" "Go:go" "PHP:php" "Perl:pl" "Swift:swift")

# Function to get the file extensions for a given language
get_extensions() {
    lang=$1
    for entry in "${languages_list[@]}"; do
        key="${entry%%:*}"
        value="${entry#*:}"
        if [ "$key" == "$lang" ]; then
            echo "$value"
            return
        fi
    done
    echo ""
}

# Function to get lines of code added and removed by language for a specific repository
get_loc_by_language() {
    repo=$1
    users=("${@:2}")
    echo "Processing repository: $repo"
    languages=$(gh api repos/$repo/languages --jq 'keys[]')
    for lang in $languages; do
        exts=$(get_extensions "$lang")
        if [ "$lang" == "Dockerfile" ]; then
            file_filter=".filename == \"$lang\""
        elif [ -z "$exts" ]; then
            continue
        else
            # Create filter for multiple extensions
            IFS=' ' read -r -a ext_array <<< "$exts"
            file_filter=""
            for ext in "${ext_array[@]}"; do
                if [ -n "$file_filter" ]; then
                    file_filter+=" or "
                fi
                file_filter+="(.filename | endswith(\".$ext\"))"
            done
            file_filter="($file_filter)"
        fi
        echo "Processing language: $lang for extensions: $exts with filter: $file_filter"

        total_loc_added=0
        total_loc_removed=0
        for user in "${users[@]}"; do
            commits=$(gh api repos/$repo/commits --paginate -q ".[] | select(.commit.author.name == \"$user\" or .commit.author.email == \"$user\").sha")
            for sha in $commits; do
                echo "Processing repo: $repo with commit: $sha"
                additions=$(gh api repos/$repo/commits/$sha --jq ".files[] | select($file_filter) | .additions")
                deletions=$(gh api repos/$repo/commits/$sha --jq ".files[] | select($file_filter) | .deletions")
                for addition in $additions; do
                    total_loc_added=$((total_loc_added + addition))
                done
                for deletion in $deletions; do
                    total_loc_removed=$((total_loc_removed + deletion))
                done
            done
        done
        echo "$repo - $lang: added: ${total_loc_added:-0}, removed: ${total_loc_removed:-0}"
    done
}

# Read the contributed_repos.txt file and process each repository
echo "Lines of code added and removed by language in each repository:"
processed_repos=()
while IFS= read -r repo_url; do
    repo=${repo_url#https://github.com/}
    if [[ ! " ${processed_repos[@]} " =~ " ${repo} " ]]; then
        get_loc_by_language $repo $current_username $previous_username
        processed_repos+=("$repo")
    fi
done < contributed-repos.txt