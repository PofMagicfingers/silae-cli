#!/usr/bin/env node

const ArgumentParser = require("argparse").ArgumentParser;
const process = require("process");
const fs = require("fs");
const path = require("path");

const Silae = require("silae");

var parser = new ArgumentParser({
  version: "0.0.1",
  addHelp: true,
  description: "Silae CLI",
  prog: "silae"
});

parser.addArgument(["username"], {});

parser.addArgument(["password"], {});

parser.addArgument(["--dest"], {
  help: "Destination folder (default: current directory)",
  metavar: "folder",
  dest: "destFolder",
  defaultValue: process.cwd()
});

var args = parser.parseArgs();
args.destFolder = path.resolve(process.cwd(), args.destFolder);

fs.access(args.destFolder, fs.constants.W_OK, function(err) {
  if (err) {
    console.error("can't write to folder: " + args.destFolder);
    process.exit(403);
  }

  console.log("Login...");
  Silae.login(args.username, args.password).then(userData => {
    console.log("Fetching bulletins...");
    Silae.getBulletins(userData).then(bulletins => {
      if (bulletins.length > 0) {
        console.log("Fetching bulletins for the last 12 months...");

        Promise.all(
          bulletins
            .filter(function(a) {
              return a.date > +new Date() - 372 * 24 * 60 * 60 * 1000;
            })
            .map(
              bul =>
                new Promise((resolve, reject) => {
                  Silae.getBulletin(userData, bul.id).then(bulletin => {
                    const fullPath = path.resolve(
                      args.destFolder,
                      `./${bul.date.getFullYear()}-${String(
                        bul.date.getMonth() + 1
                      ).padStart(2, "0")}-${String(bul.date.getDate()).padStart(
                        2,
                        "0"
                      )}.pdf`
                    );

                    fs.writeFile(fullPath, bulletin, "binary", function(err) {
                      if (err) {
                        console.log(err);
                        reject(err);
                      } else {
                        resolve(fullPath);
                      }
                    });
                  }, reject);
                })
            )
        ).then(
          files => {
            console.log("Sucessfully saved bulletins to : ");
            files.forEach(f => console.log("\t - " + f));
            process.exit(0);
          },
          err => {
            console.error("error occured");
            console.error(err);
            process.exit(500);
          }
        );
      } else {
        console.log("No bulletins found");
        process.exit(0);
      }
    });
  });
});
