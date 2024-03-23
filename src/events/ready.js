const { Events } = require('discord.js');
const {dailyCodingChallenge} = require('../services/leetcode');
const {Cron} = require('croner');

const TEST_BOT_CHANNEL_ID = "1218967822445711531";
const CRON_JOB_SCHEDULE_5_MINS = "*/5 * * * *";
const CRON_JOB_SCHEDULE_9_PM = "0 4 * * *"; // 4am UTC (default) -> 9pm PT -> 11am ICT -> 12am ET

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // --- Run at execution for testing
        // const thread = dailyCodingChallenge(TEST_BOT_CHANNEL_ID);

        // --- Cron job
        const job = Cron(CRON_JOB_SCHEDULE_5_MINS, () => {
            const thread = dailyCodingChallenge(TEST_BOT_CHANNEL_ID);
            console.log("✅ ---A new message sent!!!");
        });
	},
};