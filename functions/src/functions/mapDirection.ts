import * as functions from "firebase-functions";
import axios from "axios";

interface DrivingModel {
code: number;
message: string;
route: DrivingRouteListModel;
}

interface DrivingRouteListModel {
trafast?: DrivingRouteModel[];
tracomfort?: DrivingRouteModel[];
traoptimal?: DrivingRouteModel[];
traavoidtoll?: DrivingRouteModel[];
traavoidcaronly?: DrivingRouteModel[];
}

interface DrivingRouteModel {
summary: DrivingRouteSummaryModel;
path: number[][];
section: DrivingRouteSectionModel[];
guide: DrivingRouteGuideModel[];
}

interface DrivingRouteSummaryModel {
start: DrivingRouteLocationModel;
goal: DrivingRouteLocationModel;
waypoints: DrivingRouteLocationModel[];
distance: number;
duration: number;
pointIndx: number;
bbox: number[][];
}

interface DrivingRouteLocationModel {
location: number[];
dir?: number;
distance: number;
duration: number;
}

interface DrivingRouteSectionModel {
pointIndex: number;
pointCount: number;
distance: number;
name: string;
congestation: number;
speed: number;
}

interface DrivingRouteGuideModel {
pointIndex: number;
type: number;
instructions: string;
distance: number;
duration: number;
}

const corsWhiteList = [
  "http://localhost",
  "http://localhost:5173",
  "https://rollro.web.app",
  "https://rollro.firebseapp.com",
];

const mapDirection = functions
  .region("asia-northeast3")
  .https
  .onRequest(async (request, response) => {
    const origin = request.headers.origin ?? '';
    if (
      origin.length === 0 ||
      corsWhiteList.indexOf(origin) < 0
    ) {
      console.error("CORS Error");
      response.status(400).send();
      return;
    }
    response.set("Access-Control-Allow-Origin", "*");
  
    if (request.method === "OPTIONS") {
      response.set("Access-Control-Allow-Methods", "GET");
      response.set("Access-Control-Allow-Headers", "Content-Type");
      response.set("Access-Control-Max-Age", "3600");
      response.status(204).send("");
    } else {
      const {start, goal, waypoints, option} = request.query;
      const action = request.query.action as string;
      if (typeof action != "string" || ["direction5", "direction15"].indexOf(action) < 0) {
        console.error("Param Error");
        response.status(500).send();
        return;
      }
      if (
        typeof request.query.xid != "string" ||
        typeof request.query.xkey != "string"
      ) {
        console.error("Auth key Error");
        response.status(500).send();
        return;
      }
      if (typeof start != "string" || typeof goal != "string") {
        console.error("Param Error");
        response.status(500).send();
        return;
      }
      const xid = request.query.xid as string;
      const xkey = request.query.xkey as string;
      const query: string[] = [
        `start=${start}`,
        `goal=${goal}`,
      ];
      if (typeof waypoints === "string") {
        query.push(`waypoints=${waypoints}`);
      }
      if (typeof option === "string") {
        query.push(`option=${option}`);
      }

      const actionPath = action === 'direction15' ? 'map-direction-15' : 'map-direction';
      const path = `https://naveropenapi.apigw.ntruss.com/${actionPath}/v1/driving?${query.join("&")}`;
      const config = {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": xid,
          "X-NCP-APIGW-API-KEY": xkey,
        },
      };

      functions.logger.info(`Direction15 API: ${path}`, {structuredData: true});

      try {
        const apiResponse = await axios.get<DrivingModel>(path, config);
        const responseData: DrivingModel = apiResponse.data;

        response.json({success: true, responseData});
      } catch (error) {
        console.error("API Error", error);
        response.status(400).send(error);
      }
    }
  });

export {mapDirection};
