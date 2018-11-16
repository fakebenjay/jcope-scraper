var config = {
	mysql: {
		master: {
			user: 'root',
			password: 'root',
			database: 'example_schema',
			host: 'localhost',
			port: 8889,
			socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
		},
		slaves: [{
			user: 'root',
			password: 'root',
			database: 'example_schema',
			host: 'localhost',
			port: 8889,
			socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
		}],
		logging: true
	}
};

module.exports = config;