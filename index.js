const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const AdmZip = require("adm-zip");
const fs = require('fs').promises;
const { DOMParser } = require('xmldom');
const iconv = require('iconv-lite');

const url = "http://www.cbr.ru/s/newbik";
const dataFolder = path.resolve(__dirname, 'dataFolder');
const archieve = path.resolve(dataFolder, "archieve.zip");

async function getBIC() {
    console.log("get started")

    //download
    const response = await (await fetch(url)).buffer();
    await fs.writeFile(archieve, response, (err) => {
        if(err) return console.error(err)
    });
    
    //extract
    console.log('extracting..')
    const zip = await new AdmZip(archieve);
    zip.extractAllTo(dataFolder, true);

    //deleting zip-file

    await fs.unlink(archieve, (err) => {
        if (err) throw err;
      });

    //get xml-file
    const dataFolderFiles = await fs.readdir(dataFolder);
    let xmlName;
   
    for (item of dataFolderFiles) {
        if(path.extname(item) === ".xml") {
            xmlName = item;
        }
    }

    const xmlPath =  path.resolve(dataFolder, xmlName);
    const xmlFile = await fs.readFile(xmlPath, "utf-8",
                                      function (err, data) {
                                        if (err) throw err;
                                        return data;
                                    });

    //parsing
    const parser = new DOMParser();
    const xmlDoc =  parser.parseFromString(xmlFile, "text/xml");
    const nodesAcc = xmlDoc.getElementsByTagName("Accounts");
    
    const bicArray = []; //result
    
    Array.from(nodesAcc).forEach(item => {
        const obj = {
            bic: item.parentNode.getAttribute('BIC'),
            name: iconv.decode(item.parentNode.firstChild.getAttribute('NameP'), "utf-8"), //???
            corrAccount: item.getAttribute('Account')
        }
        bicArray.push(obj)
    }) 


    //deleting used xml-file
    await fs.unlink(xmlPath, (err) => {
        if (err) throw err;
      });

      console.log(bicArray[0], bicArray[5], bicArray[10])

}

getBIC();

/*
для запуска с интервалом (по расписанию)
setTimeout(getBIC() {
    --code--
    setTimeout(getBIC, t)
}, t)
*/