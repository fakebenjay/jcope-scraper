const _ = require("lodash"),
	async = require("async"),
		config = require(__dirname + "/config.js"),
		models = require(__dirname + "/models/index.js").models.autoLoad(),
		lib = require(__dirname + "/lib/scraperLib.js");


/* BEGIN SCRAPER HERE */
const url = "https://en.wikipedia.org/wiki/Friends";

/**
 * Leverages the get method from the scraperLib.
 * The get method returns a Promise allowing for a semantically sensical approach for asynchronous logic.
 */
lib.get(url).then((data) => {
	/** Fancy notation for extracting certain object properties as standalone variables */
	const { $, body, response } = data;

	/* Regular ol' jQuery for getting things */
	const firstGraf = $("#mw-content-text").find('p').eq(1).text();
	const charsGrafs = $("a[title='Jennifer Aniston']").closest('li').eq(0).closest('ul').find('li')
	//const charsGrafs = $('#Cast_and_characters').closest('h2').nextAll('ul').eq(0).find('li')
	// Avoid arrow function callback to avoid lexical 'this' for correct scope

	const chars = []

	charsGrafs.each(function () {
		const $this_friend = $(this)
		// RETURNS UNDEFINED
		// let castmember = this.children[0].innerText
		// let character = this.children[1].innerText
		let castmember = $this_friend.find('a').eq(0).text()
		let character = $this_friend.find('a').eq(1).text()

		chars.push({ castmember: castmember, character: character })
	})

	/* Regular ol' console log for checking the work */
	for (i = 0; i < chars.length; i++) {
		console.log(`***${chars[i].castmember} as ${chars[i].character}***`)
	}


}).catch((err) => {
	/** This is where errors go -- if the get(url) method has an error, it will be handled here */
	console.log(err);
	process.exit();
});