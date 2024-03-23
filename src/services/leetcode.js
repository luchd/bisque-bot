// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const client = require('../client');
const { EmbedBuilder } = require('discord.js');
// const BASE_URL = "https://discord.com/api/v10";
const LEETCODE_BASE_URL = "https://leetcode.com";
const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql'
const DAILY_CODING_CHALLENGE_QUERY = `
query questionOfToday {
	activeDailyCodingChallengeQuestion {
		date
		userStatus
		link
		question {
			acRate
			difficulty
			freqBar
			frontendQuestionId: questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			hasVideoSolution
			hasSolution
			topicTags {
				name
				id
				slug
			}
		}
	}
}`

const fetchDailyCodingChallenge = async () => {
    console.log(`Fetching daily coding challenge from LeetCode API.`);
    const init = {
        method: 'POST',
        headers: {
			'Content-Type': 'application/json'
		},
        body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
    }
    const response = await fetch(LEETCODE_API_ENDPOINT, init);
	if (response.headers.get('content-type').includes('json')) {
		// it's json
		const jsonRes = await response.json();
		// console.log(".> response.json(): ", jsonRes);
		return jsonRes;
	  } else {
		// it's something else
		const bufferRes = await response.arrayBuffer();
		console.log(".> response.arrayBuffer(): ", bufferRes);
		return bufferRes;
	  }
	// console.log(".> response.json(): ", response.json());
    // return response.json();
}

const sendMessage = async (channelId, message) => {
	console.log("~. Sending a message...");
	const channel = client.channels.cache.get(channelId);
	// console.log(">>> message from sendMessage: ", message);
	const colorPalette = {
		'Easy': 0x00B8A3,	// #00B8A3
		'Medium': 0xFFC01E,	// #FFC01E
		'Hard': 0xFF375F	// #FF375F
	}
	const formattedEmbed = new EmbedBuilder()
	.setColor(colorPalette[message['difficulty']])
	.setTitle(`>. ${message['title']}`)
	.setURL(message['url'])
	.setAuthor({ name: 'LeetCode_Contributor', iconURL: 'https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png'})
	.setDescription(message['description'])
	.setThumbnail('https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png')
	.addFields(
		{ name: '\u200A', value: '\u200A' },
		{ name: 'Difficulty', value: message['difficulty'], inline: true },
		{ name: '\u200A', value: '\u200A', inline: true },
		{ name: 'Acceptance', value: message['acRate'], inline: true },
		{ name: '\u200A', value: '\u200A' },
		{ name: 'Date', value: message['date'], inline: true },
		{ name: '\u200A', value: '\u200A', inline: true },
		{ name: 'Topics', value: message['topicTags'], inline: true },
	)
	.setImage('https://assets.leetcode.com/contest/weekly-contest-290/card_img_1654267980.png')
	.setTimestamp()
	.setFooter({ text: 'Stay Focused, Stay Determined!', iconURL: 'https://cdn-icons-png.flaticon.com/512/6062/6062646.png' });
	const sentMessage = await channel.send({
	    "content": "🎯 **One LeetCode A Day, Keep Unemployment Away!** 🔥",
		"tts": false,
		"embeds": [formattedEmbed]
	});
	console.log(`Sent message: ${sentMessage.content}`);
	return sentMessage;
}

const startThreadFromMessage = async (message) => {
	console.log("~. Starting a thread...");
	const thread = await message.startThread({
		name: "✅ Join us here to crack today's challenge!"
	});
	return thread;
}

const dailyCodingChallenge = (channelId) => {
	const _thread = fetchDailyCodingChallenge().then(async data => {
		const {date, link} = data['data']['activeDailyCodingChallengeQuestion'];
		const question = data['data']['activeDailyCodingChallengeQuestion']['question'];
		const {title, difficulty, topicTags, acRate} = question;
		const url = LEETCODE_BASE_URL + link;
		const formattedTag = topicTags.map(tag => tag['name']).join(' - ');
		const formattedRate = Number(acRate).toPrecision(4);
		const message = {
			"title": title,
			"difficulty": difficulty,
			"acRate": formattedRate.toString() + '%',
			"topicTags": formattedTag,
			"description": `> When you feel like giving up, remember why you started. Your dreams are waiting for you at the finish line of your hard work.`,
			"url": url,
			"date": date
		}
		console.log("::: MESSAGE ::: ", message);
		const sentMessage = await sendMessage(channelId, message);
		const thread = await startThreadFromMessage(sentMessage);
		return thread;
	});
	return _thread;
}

module.exports = {
	dailyCodingChallenge
};