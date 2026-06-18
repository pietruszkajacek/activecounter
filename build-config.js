// Code based on Simo Mafuxwana

import inquirer from "inquirer";
import { promises as fs } from "fs";
import { replaceInFileSync } from "replace-in-file";

const appFileName = "./src/app.tsx";

const pkg = JSON.parse(
  await fs.readFile(new URL("./package.json", import.meta.url))
);

const build = JSON.parse(
  await fs.readFile(new URL("./build.json", import.meta.url))
);

let major = 0,
  minor = 0,
  patch = 0;

const versionConfig = (type) => {
  if (pkg.version) {
    const currentVersion = pkg.version.split(".");
    major = parseInt(currentVersion[0]);
    minor = parseInt(currentVersion[1]);
    patch = parseInt(currentVersion[2]);
  }
  switch (type) {
    case "major":
      major++;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor++;
      patch = 0;
      break;
    case "patch":
      patch++;
      break;
  }
  pkg.version = `${major}.${minor}.${patch}`;
  fs.writeFile("package.json", JSON.stringify(pkg, null, 2));
};

inquirer
  .prompt([
    {
      type: "list",
      name: "type",
      message: "Which release is this?",
      choices: ["major", "minor", "patch"],
    },
  ])
  .then((answer) => {
    versionConfig(answer.type);

    try {
      const options = {
        files: appFileName,
        from: [
          /const version = "\d{1,3}.\d{1,3}.\d{1,3}";/,
          /const build = "([a-zA-Z0-9]+)";/,
        ],
        to: [
          `const version = "${major}.${minor}.${patch}";`,
          `const build = "${build.build}";`,
        ],
        //countMatches: false
      };
      const results = replaceInFileSync(options);
      console.log("Replacement results:", results);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
