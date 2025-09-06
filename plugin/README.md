<p align="center">
    <img alt="MC-ID" height="128px" src="public/assets/MC-ID.png">
</p>
<h1 align="center">MC-ID Plugin</h1>

This is a companion plugin for the [MC-ID](../) project.

You can grab the latest release from the [releases page](https://github.com/Tonantzintla/MC-ID/releases).

## Plugin

This plugin is designed to be used with the [MC-ID API](../api) and sends requests to the API to get the 6-digit code and display it to the user. The user can then use this code to log in the app they are using.

## Installation

1. You will need to have a [Velocity](https://papermc.io/software/velocity) server running.
2. Download the latest release from the [releases page](https://github.com/Tonantzintla/MC-ID-Plugin/releases).
3. Place the downloaded `.jar` file in the `plugins` folder of your Velocity server.
4. Start your Velocity server.
5. Configure the plugin by editing the `config.yml` file in the `plugins/MC-ID` folder.

- Leave the `file-version` as it is to ensure compatibility with future updates.
- Set the `api-endpoint` to the URL of your MC-ID API instance.
- Set the `api-key` to the same value as `PLUGIN_KEY` in your MC-ID API instance.
  - This must match the key used in the MC-ID API.
  - This is used by the plugin to authenticate requests to the API.

6. Restart your Velocity server to apply the changes.

Optionally, you can customize the server's icon, MOTD, etc.
Consult the Velocity documentation for more information on how to do this.

## Usage

Once the plugin is installed and configured, users can connect to your Velocity Minecraft server. The plugin will retrieve the 6-digit code from the MC-ID API if available and display it to the user. The user can then use this code to log in to the app they are using.

## Contributing

Check the [CONTRIBUTING.md](CONTRIBUTING.md) file for information on how to contribute to this project or on how to build the plugin from source.

## Credits

This project is maintained by [RioTheDev](https://github.com/RioTheDev) under the [Tonantzintla](https://github.com/Tonantzintla) organization.

- Main Developer: [RioTheDev](https://github.com/RioTheDev)
- Project Maintainer: [Tonantzintla](https://github.com/Tonantzintla)

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html). See the [LICENSE](LICENSE) file for more details.
