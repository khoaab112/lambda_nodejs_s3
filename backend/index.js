import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import axios from 'axios';
const KINTONE_BASE_URL = 'https://gbalb-demo.cybozu.com/';
const username = "sato"
const password = "GbalB1725Pass";

export async function handler(event) {
    try {
        var paramsID;
        if (event.rawQueryString) {
            var params = event.rawQueryString;
            params = params.split('&');
            const queryParams = {};
            params.forEach(param => {
                const [key, value] = param.split('=');
                queryParams[key] = value;
            });
            paramsID = queryParams.id;
        } else {
            const params = "";
        }
        const httpMethod = event.requestContext.http.method;
        if (httpMethod === 'POST') {
            return await postApp_5231(event);
        } else if (httpMethod === 'GET') {
            if (paramsID == 5232) {
                return await getApp_5232();
            } else if (paramsID == 5936) {
                return await getApp_5936();
            } else {
                return {
                    statusCode: 403,
                    body: JSON.stringify({ message: 'not found' })
                };
            }
        } else if (httpMethod === 'PUT') {
            return await uploadFIle(event);
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'err' })
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err })
        };
    }

}
const getApp_5232 = async () => {
    const apiKey = '0zkn5wGorNDH63R0p8akzQBkctJbsJq6B9uHFskf';
    const appId = 5232;
    const baseUrl = KINTONE_BASE_URL;
    const client = new KintoneRestAPIClient({
        baseUrl: baseUrl,
        auth: {
            apiToken: apiKey
        }
    });

    try {
        const response = await client.record.getRecords({ app: appId, query: 'limit 20', totalCount: true });
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error 1' })
        };
    }
};
const getApp_5936 = async () => {
    const apiKey = "hdUXP46uYrX00VHL5KGwJJeGTOiY7U1FvjlThSXW";
    const appId = 5936;
    const baseUrl = KINTONE_BASE_URL;
    const client = new KintoneRestAPIClient({
        baseUrl: baseUrl,
        auth: {
            apiToken: apiKey
        }
    });

    try {
        const response = await client.record.getRecords({ app: appId, query: 'limit 20', totalCount: true });
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error 2' })
        };
    }
};
const postApp_5231 = async (event) => {
    try {

        const base64DecodePass = "c2F0bzpHYmFsQjE3MjVQYXNz";
        const appId = 5231;
        const baseUrl = KINTONE_BASE_URL;
        const url = baseUrl + "k/v1/record.json?app=" + appId;
        const headers = {
            'Content-Type': 'application/json',
            'X-Cybozu-Authorization': base64DecodePass
        };
        const body = {
            "app": appId,
            "record": JSON.parse(event.body)
        };
        try {
            const response = await axios.post(url, body, { headers });
            return {
                statusCode: 200,
                body: JSON.stringify(response.data)
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify(error)
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error })
        };
    }
};
const uploadFIle = async (event) => {
    const data = JSON.parse(event.body)
    const pathS3 = data.path;
    const fileName = data.fileName;
    const baseUrl = KINTONE_BASE_URL;
    const client = new KintoneRestAPIClient({
        baseUrl: baseUrl,
        auth: {
            username: username,
            password: password,
        },
    });
    const response = await axios.get(pathS3, {
        responseType: 'arraybuffer'
    });
    try {
        const { fileKey } = await client.file.uploadFile({
            file: {
                name: fileName,
                data: response.data,
            }
        });
        return {
            statusCode: 200,
            body: JSON.stringify(fileKey)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        };
    }
};