const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const AdmZip = require("adm-zip");
const fs = require('fs').promises;
const { DOMParser } = require('xmldom');
const iconv = require('iconv-lite');

const url = "http://www.cbr.ru/s/newbik";
const dataFolder = path.resolve(__dirname, 'dataFolder');
const archieve = path.resolve(dataFolder, "archieve.zip");

const bicArray = []; //result


async function getBIC() {
    console.log("get started");

    //download
    const response = await (await fetch(url)).buffer();
 
    await fs.writeFile(archieve, response, (err) => console.log(err));
    
    //extract
    console.log('extracting..')
    const zip = new AdmZip(archieve);
    zip.extractAllTo(dataFolder, true);

   
    //get xml-file

    const dataFolderFiles = await fs.readdir(dataFolder, (err) => console.error(err));
    
    let xmlName; //имя файла .xml
   
    for (item of dataFolderFiles) {
        if(path.extname(item) === ".xml") {
            xmlName = item;
        }
    }

    const xmlPath =  path.resolve(dataFolder, xmlName);

    const xmlFileB = await fs.readFile(xmlPath, (err) => console.error(err));
    
    const xmlFile = iconv.decode(Buffer.from(xmlFileB), "win1251")

    //parsing
    const parser = new DOMParser();
    const xmlDoc =  parser.parseFromString(xmlFile, "text/xml");
    const nodesAcc = xmlDoc.getElementsByTagName("Accounts");
    
    
    Array.from(nodesAcc).forEach(item => {
        const obj = {
            bic: item.parentNode.getAttribute('BIC'),
            name: item.parentNode.firstChild.getAttribute('NameP'), //???
            corrAccount: item.getAttribute('Account')
        }
        bicArray.push(obj);
    }) 


    //deleting used xml-file
        await fs.unlink(xmlPath, (err)=>console.error(err));
        

      console.log(bicArray[0], bicArray[5], bicArray[10]);

}

getBIC();
module.exports = bicArray;
/*
для запуска с интервалом (по расписанию)
setTimeout(getBIC() {
    --code--
    setTimeout(getBIC, t)
}, t)
*/