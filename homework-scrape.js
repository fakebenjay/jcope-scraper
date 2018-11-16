const _ = require("lodash"),
	async = require("async"),
		config = require(__dirname + "/config.js"),
		tables = require(__dirname + "/models/index.js").models.autoLoad(),
		lib = require(__dirname + "/lib/scraperLib.js");


/* BEGIN SCRAPER HERE */
const url = "https://en.wikipedia.org/wiki/Compars_Herrmann";

/**
 * Leverages the get method from the scraperLib.
 * The get method returns a Promise allowing for a semantically sensical approach for asynchronous logic.
 */
lib.get(url).then((data) => {
	/** Fancy notation for extracting certain object properties as standalone variables */
	const { $, body, response } = data;

	/* Regular ol' jQuery for getting things */
	const list = []
	const title = $("h1#firstHeading").text();
	const headers = $('span.mw-headline')
	const firstGrafs = $("h2 + p")

	// headers.each(function () {
	// 	$thisHeader = $(this)
	// })

	for (let i = 0; i < firstGrafs.length; i++) {
		const subhead = {
			header: headers.eq(i).text(),
			first_graf: firstGrafs.eq(i).text()
		}

		list.push(subhead)
		tables.scrape.create(subhead, function (row, cb) {
			console.log(`${subhead.header} done`)
		})
	}

	// Avoid arrow function callback to avoid lexical 'this' for correct scope

	console.log(`\x1b[40m${title}\x1b[0m`)
	/* Regular ol' console log for checking the work */
	for (let j = 0; j < list.length; j++) {
		console.log(list[j])
	}

}).catch((err) => {
	/** This is where errors go -- if the get(url) method has an error, it will be handled here */
	console.log(err);
	process.exit();
});