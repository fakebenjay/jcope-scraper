const _ = require("lodash"),
	async = require("async"),
		config = require(__dirname + "/config.js"),
		tables = require(__dirname + "/models/index.js").models.autoLoad(),
		lib = require(__dirname + "/lib/scraperLib.js");

/* BEGIN SCRAPER HERE */
const puppeteer = require('puppeteer');

(async () => {
	//LAUNCH BROWSER AND OPEN PAGE
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	//GO TO SEARCH PAGE
	await page.goto('https://onlineapps.jcope.ny.gov/LobbyWatch/Administration/LB_QReports.aspx?x=EGw%2bBNjmIIk%2bTQUBGN7pED10fXAXcogZP6GEV89sCdPw8eiEP2cWlFV0iTpwqOHAVtn1TV6YrB%2fe5fTYLs%2fVIiqqkRBl4cW6GDnl1CDH%2fGxDZWR2k7wHqkWtmdfh4mnaZveXrARrFWVY0V3cIOY6x467ipQk3eev2BXieMuPcJK2', { waitUntil: ['load', 'domcontentloaded'] });

	//ENTER CLIENT NAME QUERY
	const inputSelector = 'input#txtQCName';
	await page.type(inputSelector, 'uber')

	//HIT SEARCH BUTTON
	const buttonSelector = '#btnSearch'
	await page.click(buttonSelector)

	//Wait until DOM content loaded, add jQuery to page
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
	await page.waitForSelector('tr.Row');
	await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })

	//Define master link list, gather 'View' links
	let fullLinkList = []
	const linkList = await page.evaluate(() => {
		let rows = document.querySelectorAll('tr.Row');

		let links = []

		rows.forEach((r) => {
			let link = r.getElementsByTagName('a')[0].href
			links.push(link)
		})
		return links
	})

	//Save current page number and total page count
	let pageCount = await page.evaluate(() => parseInt(document.querySelectorAll('div.GridFooterText')[1].children[1].innerText))
	let pageNum = await page.evaluate(() => parseInt(document.querySelectorAll('div.GridFooterText')[1].children[0].innerText))

	//Find link to go to next page, try and fail to click on link
	let nextSelector = `a[onclick='DisplayGrid.Page(${pageNum});return false;']`
	await page.waitForSelector(nextSelector);
	await page.$eval(nextSelector, el => el.click())
	//Don't know why this function doesn't work
	// await page.click(nextSelector)

	//Move page's links to master link list
	linkList.forEach((link) => {
		fullLinkList.push(link)
	})

	//Print master link list
	console.log(fullLinkList)
})()

/**
 * Leverages the get method from the scraperLib.
 * The get method returns a Promise allowing for a semantically sensical approach for asynchronous logic.
 */
// lib.get(url).then((data) => {
// 	/** Fancy notation for extracting certain object properties as standalone variables */
// 	const { $, body, response } = data;
//
// 	/* Regular ol' jQuery for getting things */
// 	const list = []
// 	const title = $("h1#firstHeading").text();
// 	const headers = $('span.mw-headline')
// 	const firstGrafs = $("h2 + p")
//
// 	// headers.each(function () {
// 	// 	$thisHeader = $(this)
// 	// })
//
// 	for (let i = 0; i < firstGrafs.length; i++) {
// 		const subhead = {
// 			header: headers.eq(i).text(),
// 			first_graf: firstGrafs.eq(i).text()
// 		}
//
// 		list.push(subhead)
// 		tables.scrape.create(subhead, function (row, cb) {
// 			console.log(`${subhead.header} done`)
// 		})
// 	}
//
// 	// Avoid arrow function callback to avoid lexical 'this' for correct scope
//
// 	console.log(`\x1b[40m${title}\x1b[0m`)
// 	/* Regular ol' console log for checking the work */
// 	for (let j = 0; j < list.length; j++) {
// 		console.log(list[j])
// 	}
//
// }).catch((err) => {
// 	/** This is where errors go -- if the get(url) method has an error, it will be handled here */
// 	console.log(err);
// 	process.exit();
// });