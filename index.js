const ArgumentParser = require('argparse').ArgumentParser;
const process = require("process");
const fs = require("fs");
const path = require("path");

require("babel-register");
require("babel-polyfill");
const Silae = require("./lib/silae");

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Silae CLI'
});

parser.addArgument(
  [ 'username' ],
  { }
);

parser.addArgument(
  [ 'password' ],
  { }
);

var args = parser.parseArgs();

const main = async () => {
    console.log("Login...");
    const userData = await Silae.login(args.username, args.password);
    console.log("Fetching bulletins...");
    const bulletins = await Silae.getBulletins(userData);
    if(bulletins.length > 0) {
        console.log("Fetching last bulletin...");
        const last = bulletins.sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        })[0];

        const bulletin = await Silae.getBulletin(userData, last.id);
        const fullPath = path.resolve(process.cwd(), `./${last.date.toISOString().slice(0,7)}.pdf`);

        fs.writeFile(fullPath, bulletin,  "binary", function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log(`The file was saved at : ${fullPath} !`);
            }
        });
    }
};

main();
