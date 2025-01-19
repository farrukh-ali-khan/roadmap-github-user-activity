#!/usr/bin/env node

// Import the https module to make HTTPS requests
const https = require("https");

// Check if a GitHub username is provided as a command-line argument
if (process.argv.length < 3) {
  console.error("Usage: github-activity <username>");
  process.exit(1);
}

// Get the GitHub username from the command-line arguments
const username = process.argv[2];
// Construct the URL to fetch the user's recent activity from GitHub API
const url = `https://api.github.com/users/${username}/events`;

// Set the options for the HTTPS request, including the user agent
const options = {
  headers: {
    "User-Agent": "node.js", // GitHub API requires a user agent to be specified
  },
};

// Make an HTTPS GET request to the GitHub API
https
  .get(url, options, (res) => {
    let data = "";

    // Listen for data chunks and concatenate them to the 'data' variable
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Listen for the end of the response
    res.on("end", () => {
      // Check if the response status code is not 200 (OK)
      if (res.statusCode !== 200) {
        console.error(
          `Failed to fetch activity for user ${username}. Status code: ${res.statusCode}`
        );
        process.exit(1);
      }

      try {
        // Parse the response data as JSON
        const events = JSON.parse(data);
        // Check if there are no events
        if (events.length === 0) {
          console.log(`No recent activity found for user ${username}.`);
          return;
        }

        // Loop through each event and display a message based on the event type
        events.forEach((event) => {
          switch (event.type) {
            case "PushEvent":
              console.log(
                `Pushed ${event.payload.commits.length} commits to ${event.repo.name}`
              );
              break;
            case "IssuesEvent":
              console.log(`Opened a new issue in ${event.repo.name}`);
              break;
            case "WatchEvent":
              console.log(`Starred ${event.repo.name}`);
              break;
            default:
              console.log(`${event.type} in ${event.repo.name}`);
              break;
          }
        });
      } catch (error) {
        // Handle JSON parsing errors
        console.error("Failed to parse response data:", error.message);
        process.exit(1);
      }
    });
  })
  .on("error", (error) => {
    // Handle errors that occur during the HTTPS request
    console.error("Error fetching data:", error.message);
    process.exit(1);
  });
