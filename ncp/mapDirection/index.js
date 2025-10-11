// 환경 변수 로드 (로컬 개발용)
require('dotenv').config();

const axios = require('axios');

exports.main = async (params) => {
	try {
		const { start, goal, waypoints, option } = params;
		const targetUrl = 'https://maps.apigw.ntruss.com/map-direction/v1/driving';

		// 환경 변수에서 API 키를 읽어옵니다
		const apiKeyId = process.env.NCP_APIGW_API_KEY_ID;
		const apiKey = process.env.NCP_APIGW_API_KEY;

		// API 키가 설정되지 않은 경우 에러 반환
		if (!apiKeyId || !apiKey) {
			console.error('NCP API keys are not configured');
			return {
				statusCode: 500,
				body: JSON.stringify({
					error: 'NCP API keys are not configured. Please set NCP_APIGW_API_KEY_ID and NCP_APIGW_API_KEY environment variables.'
				})
			};
		}

		const options = {
			method: 'GET',
			url: targetUrl,
			params: { start, goal, waypoints, option },
			headers: {
				'x-ncp-apigw-api-key-id': apiKeyId,
				'x-ncp-apigw-api-key': apiKey
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

