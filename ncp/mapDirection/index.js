// 환경 변수 로드 (.env 파일이 있는 경우)
require('dotenv').config();

const axios = require('axios');

exports.main = async (params) => {
	try {
		const { start, goal, waypoints, option } = params;
		const targetUrl = 'https://maps.apigw.ntruss.com/map-direction/v1/driving';

		// API 키 가져오기
		// 1. params에서 (디폴트 파라미터)
		// 2. process.env에서 (.env 파일)
		const apiKeyId = params.NCP_APIGW_API_KEY_ID || process.env.NCP_APIGW_API_KEY_ID;
		const apiKey = params.NCP_APIGW_API_KEY || process.env.NCP_APIGW_API_KEY;

		// API 키가 설정되지 않은 경우 에러 반환
		if (!apiKeyId || !apiKey) {
			console.error('NCP API keys are not configured');
			return {
				statusCode: 500,
				body: JSON.stringify({
					error: 'NCP API keys are not configured. Please set NCP_APIGW_API_KEY_ID and NCP_APIGW_API_KEY in default parameters or environment variables.'
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

