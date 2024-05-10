const fs = require('node:fs');

let readDir = "";
let outDir = "";
let routesRegex = /(?:get|post|delete|put|patch\s).*?(?=\sdo)/g;
let exit = false;

// Process arguments
process.argv.forEach(function (val, index, array) {
    if (index <= 1) {
        return;
    }

    if (val === '--out') {
        outDir = array[index + 1];
    } 

    if (val === '--src') {
        readDir = array[index + 1];
    }

    if (val === '--routesRegex') {
        routesRegex = array[index + 1];
    }

    if (val === '--help') {
        console.log("Example usage: rtp --src ./controllers --out ./outDir/newCollection.postman.json");
        console.log("--out <path_to_dist_file> [REQUIRED: Path to the postman.json file]");
        console.log("--src <path_to_controllers_folder> [REQUIRED: The path to the controllers folder]");
        console.log("--routesRegex <new_regex> [OPTIONAL: You can specify your own regex matching here for inside the controllers]");
        exit = true;
    }
});

if (exit) {
    process.exit(0);
}

// If out or src are relative, append the current execution folder to them
if (outDir.startsWith('.')) {
    outDir.replace(/^/, process.cwd());
}

if (readDir.startsWith('.')) {
    readDir.replace(/^/, process.cwd());
}

const json = 	{
    info: {
        name: "MT Showcase Server",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: []
}

// Get file names in src directory so we can later read them one by one
let fileNames = fs.readdirSync(readDir);

fileNames.forEach(fileName => {
    const fileContents = fs.readFileSync(readDir + "\\" + fileName, "utf-8");

    let matches = [...fileContents.matchAll(routesRegex)];

    const newFolder = {
        name: fileName.split('.')[0],
        item: [],
    }

    matches.forEach((elem) => {
        const element = elem[0];
        const url = element.split(' ')[1].replaceAll("'", "");
        const method = element.split(' ')[0];
        const path = url.split('/').filter(word => word.length > 0);

        const newRequest = {
            name: url,
            request:  {
                "method": method,
                "header": [],
                "url": {
                    "raw": `{{domain}}${url}`,
                    "host": [
                        "{{domain}}"
                    ],
                    "path": path
                }
            },
            response: [],
        }
        newFolder.item.push(newRequest);
    })
    json.item.push(newFolder);
});

fs.writeFile(outDir, JSON.stringify(json, null, 2), () => {});