# Contributing

Thank you for your interest in contributing to the MC-ID Plugin! We welcome contributions from the community to help improve the plugin and its functionality.

## Prerequisites

Before contributing, please ensure you have the following:

- A basic understanding of Java and the Minecraft plugin development environment.
- Familiarity with the Velocity server and how to set it up.
- A GitHub account to submit pull requests.

Software Requirements:

- Java version 17
- Gradle version 8.x
- A local development environment set up for Java development.

## Getting Started

1. Fork the repository
2. Clone your forked repository to your local machine
3. Run `gradle` to set up the project and download dependencies
4. Run `gradle build` to compile the plugin and create a `.jar` file in the `build/libs` directory.
5. Test the plugin on your local Velocity server to ensure it works as expected.

You will need the `*-all.jar` file from the `build/libs` directory to run the plugin on your Velocity server.

## Notes

It's heavily recommended to use the [MC-ID API](https://github.com/Tonantzintla/MC-ID-API) locally when testing the plugin. As the plugin relies on the API to retrieve the 6-digit code, having a running instance of the API will allow you to test the plugin's functionality effectively.
