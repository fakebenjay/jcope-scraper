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

	//ENTER CLIENT NAME QUERY (searches for all filings if param is '')
	const inputSelector = 'input#txtQCName';
	await page.type(inputSelector, 'uber')

	//HIT SEARCH BUTTON
	const buttonSelector = '#btnSearch'
	await page.click(buttonSelector)

	//Wait until DOM content loaded, add jQuery to page
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
	await page.waitForSelector('tr.Row');
	await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' })

	//Save current page number and total page count
	let pageCount = await page.evaluate(() => parseInt(document.querySelectorAll('div.GridFooterText')[1].children[1].innerText))
	let pageNum = await page.evaluate(() => parseInt(document.querySelectorAll('div.GridFooterText')[1].children[0].innerText))

	//Define master link list
	let fullLinkList = []

	for (pageNum; pageNum <= pageCount; pageNum++) {
		//Gather 'View' links
		const linkList = await page.evaluate(() => {
			let rows = document.querySelectorAll('tr.Row');
			let links = []

			rows.forEach((r) => {
				let link = r.getElementsByTagName('a')[0].href
				links.push(link)
			})
			return links
		})

		//Find link to go to next page, try and fail to click on link
		let nextSelector = `a[onclick='DisplayGrid.Page(${pageNum});return false;']`
		// await page.waitForSelector(nextSelector);

		//Click next page link if not last page
		if (await page.$(nextSelector) !== null) {
			await page.$eval(nextSelector, el => el.click())
			//Don't know why this function doesn't work
			// await page.click(nextSelector)
		}

		//Move page's links to master link list
		linkList.forEach((link) => {
			fullLinkList.push(link)
		})
	}
	//Close browser window
	browser.close()

	//Print master link list
	console.log(fullLinkList)

	/**
	 * Leverages the get method from the scraperLib.
	 * The get method returns a Promise allowing for a semantically sensical approach for asynchronous logic.
	 */
	fullLinkList.forEach((url) => {
		lib.get(url).then((data) => {
			/** Fancy notation for extracting certain object properties as standalone variables */
			const { $, body, response } = data;

			/* Regular ol' jQuery for getting things */
			const period = $('#lblcsrPeriod').text()
			const year = $('#lblcsrYear').text()

			const clientName = $('#lblCName').text().trim()
			const clientAddress = $('#lblCAddress').text().trim()
			const clientPhone = $('#lblCPhone').text().trim()
			const clientCAO = $('#lblCAOfficer').text().trim()
			const lobbyingType = $('#lblTOLobbying').text().trim()

			//Properties to scrape for a later version of this, more comprehensive, client-facing version of this
			const subjects = $('#tblSubjects').text().trim()
			const lobbyees = $('#tblPersons').text().trim()
			const bills = $('#tblBills').text().trim()
			const titleIDNum = $('#tblTitle').text().trim()
			const execOrder = $('#tblNumber').text().trim()
			const tribalCompacts = $('#tblSMatter').text().trim()

			//Get sibling spans of lobbyist compensation amounts
			const currPeriodCompRef = $("span:contains('Compensation for current period:')")
			// const lobbyistSubHeads = $("#LobbyistInfo_tdECGrid .SubHead")

			//Gets lobbyist compensation spans based on neighborind spans, converts to integers
			const lobbyistCompArray = currPeriodCompRef.toArray().map((ref) => {
				return parseInt(ref.parent.parent.children[3].children[0].data.trim())
			})

			//Totals all lobbyist compensation fees
			const lobbyistCompensation = lobbyistCompArray.reduce((total, num) => { return total + num })
			const lobbyingExpenses = parseInt($('span#lblTotExp').text().replace('$', ''))

			const filing = {
				clientName: clientName,
				period: period,
				year: year,
				clientAddress: clientAddress,
				clientPhone: clientPhone,
				clientCAO: clientCAO,
				lobbyingType: lobbyingType,
				lobbyistCompensation: lobbyistCompensation,
				lobbyingExpenses: lobbyingExpenses
			}

			/* Regular ol' console log for checking the work */
			console.log(`${filing.clientName} (${period} ${year})`)

			// Push to MySQL
			tables.scrape.create(filing, function (row, cb) {
				console.log(`${filing.clientname} (${period} ${year}) done`)
			})
		}).catch((err) => {
			/** This is where errors go -- if the get(url) method has an error, it will be handled here */
			console.log(err);
			process.exit();
		})
	})
})()