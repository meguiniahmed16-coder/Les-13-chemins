import core from './worker.js';
import {createAdminHandler} from './web-admin-handler.js';
import {sendDailyDigest} from './visits.js';
const app=createAdminHandler(core);
export default {...app,async scheduled(event,env,ctx){ctx.waitUntil(sendDailyDigest(env,event.scheduledTime));}};
