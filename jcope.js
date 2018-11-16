const _ = require("lodash"),
	async = require("async"),
		config = require(__dirname + "/config.js"),
		tables = require(__dirname + "/models/index.js").models.autoLoad(),
		lib = require(__dirname + "/lib/scraperLib.js");


/* BEGIN SCRAPER HERE */
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto('https://onlineapps.jcope.ny.gov/LobbyWatch/Administration/LB_QReports.aspx?x=EGw%2bBNjmIIk%2bTQUBGN7pED10fXAXcogZP6GEV89sCdPw8eiEP2cWlFV0iTpwqOHAVtn1TV6YrB%2fe5fTYLs%2fVIiqqkRBl4cW6GDnl1CDH%2fGxDZWR2k7wHqkWtmdfh4mnaZveXrARrFWVY0V3cIOY6x467ipQk3eev2BXieMuPcJK2', { waitUntil: ['load', 'domcontentloaded'] });

	const inputSelector = 'input#txtQCName';
	await page.type(inputSelector, '')

	const buttonSelector = '#btnSearch'
	await page.click(buttonSelector)

	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
	await page.waitForSelector('tr.Row');
	await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })

	const linkList = await page.evaluate(() => {
		let rows = document.querySelectorAll('tr.Row');

		let links = []

		let pageCount = parseInt(document.querySelectorAll('div.GridFooterText')[1].children[1].innerText)
		let pageNum = parseInt(document.querySelectorAll('div.GridFooterText')[1].children[0].innerText)

		var paginationDiv = document.querySelectorAll('div.GridFooterText')[0].children

		for (let i = 0; i < paginationDiv.length; i++) {
			if (parseInt(paginationDiv[i].innerText) === pageNum + 1) {
				let nextPage = paginationDiv[i]
				console.log(`okay! ${paginationDiv[i].innerText}`)
			} else {
				console.log(`womp womp ${paginationDiv[i].innerText}`)
			}
		}

		// paginationArray.forEach((num) => {
		// 	console.log(parseInt(num.innerText))
		// 	console.log(pageNum)
		// 	if (parseInt(num.innerText) === pageNum + 1) {
		// 		console.log('okay!')
		// 	} else {
		// 		console.log('womp womp')
		// 	}
		// })

		rows.forEach((r) => {
			let link = r.getElementsByTagName('a')[0].href
			links.push(link)
		})
		return links
	})
	console.log(linkList)
	console.log(nextPage)
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