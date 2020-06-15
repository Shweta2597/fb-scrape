//Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol.
const puppeteer = require('puppeteer')
//A regular expression for matching phone numbers.
var phone = require('phone-regex');
//For file system management
const fs = require('fs')
//Configuration file for facebook username and password
const config = require('./config.json')
//Cookies used - so that user dont see login screen again and again. Once logged in, data will be fetched then from cookies.json
const cookies = require('./cookies.json');
// official MongoDB driver for Node.js. Provides a high-level API on top of mongodb-core that is meant for end users.
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

// For getting connected to database
const connectionUrl = "mongodb://127.0.0.1/27017"
// Const for database name
const databaseName = "web-scraping"

console.log(Object.keys(cookies).length);

// Helper function
async function getElText(page, selector){
    return  await page.evaluate((selector) => {
        return document.querySelector(selector).innerText
    },selector);
}

// Main function
(async () => {
    console.log("Hello shweta");
    // This will allow Puppeteer to start a new real browser session
    let browser = await puppeteer.launch({headless:false});
    let page = await browser.newPage();
    // In case if cookies are available and user logged in once 
    if(Object.keys(cookies).length){
        await page.setCookie(...cookies);
        await page.goto('https://www.facebook.com/',{waitUntil:'networkidle2'})
    }
    // For first time
    else{
        await page.goto('https://www.facebook.com/login',{waitUntil:'networkidle2'})
        await page.type('#email',config.username,{delay:30});
        await page.type('#pass',config.password,{delay:30});
        await page.click('#loginbutton');
        await page.waitForNavigation({waitUntil:'networkidle0'});
    }
    await page.type('input.oajrlxb2','drop your whatsapp number')
    await page.waitFor(2000);
    await page.click('span.oi732d6d.ik7dh3pa.d2edcug0.qv66sw1b');
    await page.waitFor(2000);

    await page.evaluate(()=>document.querySelector('div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.d2edcug0.aahdfvyu.tvmbv18p:nth-child(2) > div > a.oajrlxb2.gs1a9yip.g5ia77u1.mtkw9kbi.tlpljxtp.qensuy8j.ppp5ayq2.goun2846.ccm00jje.s44p3ltw.mk2mc5f4.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2').click())
    await page.waitFor(2000);
    await page.click('div.d2edcug0.glvd648r.o7dlgrpb:nth-child(1) > div > div.sjgh65i0 > div.j83agx80.l9j0dhe7.k4urcfbm > div.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7 > div > div > div.jb3vyjys.hv4rvrfc.ihqw7lf3.dati1w0a')
    await page.waitFor(2000);

    // For scrolling the page
    await page.evaluate(_ => {
        window.scrollBy(0, window.innerHeight);
      });
    await page.waitFor(2000);

    // For going to comments section
    await page.evaluate(()=>document.querySelector('div.oajrlxb2.bp9cbjyn.g5ia77u1.mtkw9kbi.tlpljxtp.qensuy8j.ppp5ayq2.goun2846.ccm00jje.s44p3ltw.mk2mc5f4.rt8b4zig.n8ej3o3l.agehan2d.sk4xxmp2.rq0escxv.nhd2j8a9.pq6dq46d.mg4g778l.btwxx1t3.pfnyh3mw.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.tgvbjcpo.hpfvmrgz.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.l9j0dhe7.i1ao9s8h').click())
    await page.waitFor(2000);

    // For saving cookies to cookies.json if its available
    let currentCookies = await page.cookies();
    fs.writeFileSync('./cookies.json',JSON.stringify(currentCookies));
 
    // Find each comment and store them in an array
    /*we first initialize the comments array to store our scraped comments. 
    Then we write a loop to go through first 50 comments,
    we then wait for the selectors we’re looking for to exist first and 
    extract the selector’s content with our helper function getElText() */
    const comments = [];
    try{
        for(let i=1;i<50;i++){  
            const nameSelector = `li:nth-child(${i}) > div > div.l9j0dhe7.ecm0bbzt.hv4rvrfc.qt6c0cv9.dati1w0a.lzcic4wl.btwxx1t3.j83agx80 > div.stjgntxs.ni8dbmo4.g3eujd1d > div > div.c1et5uql.bvz0fpym.sf5mxxl7.q9uorilb > div._680y > div._6cuy > div.b3i9ofy5.e72ty7fz.qlfml3jp.inkptoze.qmr60zad.rq0escxv.oo9gr5id.q9uorilb.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.d2edcug0.jm1wdb64.l9j0dhe7.l3itjdph.qv66sw1b > div.tw6a2znq.sj5x9vvc.d1544ag0.cxgpxx05 > span > div.nc684nl6 `;
            const numberSelector = `li:nth-child(${i}) > div > div.l9j0dhe7.ecm0bbzt.hv4rvrfc.qt6c0cv9.dati1w0a.lzcic4wl.btwxx1t3.j83agx80 > div.stjgntxs.ni8dbmo4.g3eujd1d > div > div.c1et5uql.bvz0fpym.sf5mxxl7.q9uorilb > div._680y > div._6cuy > div.b3i9ofy5.e72ty7fz.qlfml3jp.inkptoze.qmr60zad.rq0escxv.oo9gr5id.q9uorilb.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.d2edcug0.jm1wdb64.l9j0dhe7.l3itjdph.qv66sw1b > div.tw6a2znq.sj5x9vvc.d1544ag0.cxgpxx05 > div.ecm0bbzt.e5nlhep0.a8c37x1j `;
            await page.waitForSelector(nameSelector);
            await page.waitForSelector(numberSelector);
            const name = await getElText(page,nameSelector);
            const number = await getElText(page,numberSelector);
            // Regex for extracting mobile numbers from comments
            var pattern = /^[1-9]{1}[0-9]{9}$/;
            var res = number.match( pattern );
            if (res){
                console.log(name);
                console.log(number);
            // Pushing name and number to comments as object
            comments.push({
                name : name,
                number : number
            });
        }
    }
}
catch(exception){}

// Connection to mongo    
MongoClient.connect(connectionUrl,{useNewUrlParser:true},(error,client)=>{
    if(error){
        return console.log("Unable to connect to database")
    }
    console.log("Connected successfully")
    // Connection to databse    
    const db = client.db(databaseName)
    // Inserting data in database
    db.collection('fb_scraped_data').insertOne({
        comments
    })
    })
})();