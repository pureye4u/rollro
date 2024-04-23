const axios = require('axios');

exports.main = async (params) => {
	try {
		const { start, goal, waypoints, option } = params;
		const targetUrl = 'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving';

		const options = {
			method: 'GET',
			url: targetUrl,
			params: { start, goal, waypoints, option },
			headers: {
				'X-NCP-APIGW-API-KEY-ID': 'j8gkbz5wnq',
				'X-NCP-APIGW-API-KEY': 'sRl2fIHNaDkgF79kK5Sx51TboKIThdM6fBAj5ApB'
			},
		};

		const response = await axios(options);

		return { responseData: response.data };
	} catch (error) {
		console.error('Error making HTTP request:', error);
		return {
			statusCode: error.response ? error.response.status : 500,
			body: JSON.stringify({
				error: error.message
			})
		};
	}
};