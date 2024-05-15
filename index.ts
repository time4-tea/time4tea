import { exec } from "child_process";

// readFile docker-compose.yml
import fs from "fs";
import path from "path";
import dockerComposeTemplate from "./docker-compose.tml.yml" with { type: "text", embed: "true" };

export const commandExists = (command: string): Promise<boolean> => {
  return new Promise((resolve) => {
    exec(`command -v ${command}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

function prompt(question: string, defaultValue: string) {
  console.log("\x1b[0m");
  process.stdout.write(question + " [" + defaultValue + "]: ");
  return new Promise((resolve) => {
    process.stdin.on("data", (data) => {
      resolve(data.toString().trim() || defaultValue);
    });
  });
}

function success(s) {
  console.log("\x1b[32m", "✅ -", s);
}
function error(s) {
  console.log("\x1b[31m", "❌ -", s);
}

// helper for running a command in terminal
function run(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// helper for making folders
function mkdir(path: string) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
function info(s) {
  console.log("\x1b[34m", "ℹ️ -", s);
}
async function main() {
  const brew = await commandExists("brew");
  if (!brew) {
    error(
      "brew hasn't been installed, goto: https://brew.sh/ and copy the command to install. then come back here and run the command again."
    );
    return;
  }
  success("brew exists");
  const colima = await commandExists("colima");
  if (!colima) {
    info("colima hasn't been installed, installing...");
    await exec("brew install colima");
    success("installed colima");
  }
  success("colima exists");
//   await exec("colima delete"); // tears down and retries

  const docker = await commandExists("docker");
  if (!docker) {
    info("docker hasn't been installed, installing...");
    await exec("brew install docker");
    success("installed docker");
    // return;
  }
  success("docker exists");
  const plex = await commandExists("plex");
  if (!plex) {
    info("plex hasn't been installed, installing...");
    await exec("brew install plex-media-server");
    success("installed plex");
    // return;
  }
  success("plex exists");
  const home = await run("echo $HOME");

  // check ~/data exists
  const dataDirExists = fs.existsSync(`${home.replace("\n", "")}/data`);
  let dataDir: string = dataDirExists ? `${home.replace("\n", "")}/data` : "";
  if (!dataDirExists) {
      dataDir = await prompt(
        "data directory and location to store downloads",
        `${home.replace("\n", "")}/data`
      );
      await mkdir(dataDir);
      await mkdir(`${dataDir}/transmission`);
      await mkdir(`${dataDir}/radarr`);
      await mkdir(`${dataDir}/sonarr`);
      await mkdir(`${dataDir}/jackett`);
      await mkdir(`${dataDir}/downloads`);
      success("data directory created");
  } 
  success("has a data directory");

  const timezone = await prompt(
    "timezone see list: https://timezonedb.com/time-zones",
    "America/New_York"
  );
  //   console.log(timezone);
  const puid = await run("id -u");
  //   console.log(puid);
  const pgid = await run("id -g");
  //   console.log(pgid);

  const nordvpnusername = await prompt("NordVPN Username", "");
  const nordvpnpassword = await prompt("NordVPN Password", "");
  const nordvpncountry = await prompt("NordVPN Country", "");
  if (!nordvpnusername || !nordvpnpassword || !nordvpncountry) {
    error("NordVPN credentials are required");
    process.exit(1);
    return;
  }
  const dockerCompose = dockerComposeTemplate
    .replace(/{{timezone}}/g, timezone)
    .replace(/{{PUID}}/g, puid)
    .replace(/{{PGID}}/g, pgid)
    .replace(/{{DATA_DIR}}/g, dataDir)
    .replace(/{{NORDVPN_USERNAME}}/g, nordvpnusername)
    .replace(/{{NORDVPN_PASSWORD}}/g, nordvpnpassword)
    .replace(/{{NORDVPN_COUNTRY}}/g, nordvpncountry);
  // write docker-compose.yml
  fs.writeFileSync("docker-compose.yml", dockerCompose);
  success("docker-compose.yml created");

  // start colima
  await run("colima start");
  success("docker runtime started");

  await run("starting services");

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 15000);
  })

  success("services running");

  success("now navigate to jackett http://localhost:9117");
  success("now navigate to transmission http://localhost:9091");
  success("now navigate to sonarr http://localhost:8989");
  success("now navigate to radarr http://localhost:7878");
  process.exit();
}

main();
