import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version;

if (!version) {
  throw new Error("package.json version is missing");
}

const notes =
  "See full changelog: https://github.com/Tonantzintla/MC-ID/blob/main/CHANGELOG.md\n";
writeFileSync("RELEASE_NOTES.md", notes, "utf8");

execSync("./gradlew build", {
  cwd: "plugin",
  stdio: "inherit",
  env: {
    ...process.env,
    RELEASE_VERSION: version
  }
});

execSync("cp plugin/build/libs/*-all.jar plugin/build/libs/mc-id-auth-latest.jar", {
  stdio: "inherit"
});

execSync(
  `gh release create v${version} ` +
    "plugin/build/libs/*-all.jar " +
    "plugin/build/libs/mc-id-auth-latest.jar " +
    `--title \"v${version}\" --notes-file RELEASE_NOTES.md`,
  { stdio: "inherit" }
);
