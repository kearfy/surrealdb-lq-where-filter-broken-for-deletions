import { Surreal } from "https://deno.land/x/surrealdb@v0.8.4/src/index.ts";

const endpoint = 'ws://127.0.0.1:8000/rpc';
const namespace = 'test';
const database = 'test-' + (Math.random() * 100000).toString().slice(0, 5);
const username = 'root';
const password = 'root';

console.log(' ');
console.log('This script will timeout at every step for 1 second to let messages come through nicely');

console.log(' ');
console.log(`MAIN - Connecting to:  "${endpoint}"`);
console.log(`MAIN - With namespace: "${namespace}"`);
console.log(`MAIN - With database:  "${database}"`);

const db = new Surreal(endpoint, {
    ns: namespace,
    db: database,
    auth: {
        user: username,
        pass: password,
    },
});



///////////////////////////////////
///// STARTING THE LIVE QUERY /////
///////////////////////////////////

console.log(' ');
console.log("MAIN - Starting live query");
const [lq] = await db.query<[string]>("LIVE SELECT * FROM person WHERE verified = true");
if (!lq.result) throw new Error("Failed to initiate LQ: " + lq.detail);
console.log("MAIN - Uuid is: " + lq.result);

console.log("MAIN - Registering LQ listener");
await db.listenLive(lq.result, ({ action, result, detail }) => {
    if (action === 'CLOSE') {
        console.log("LIVE - LQ is closed:", detail);
    } else if (action === 'DELETE') {
        console.log(`LIVE - !! ${action} ${result}`);
    } else {
        console.log(`LIVE - !! ${action} ${result.id} WHERE verified = ${result.verified ? 'true' : 'false'}`);
    }
});



///////////////////////////////////
//// STARTING NONE LIVE QUERY /////
///////////////////////////////////

console.log(' ');
console.log("MAIN - Starting \"NONE\" live query");
const [none] = await db.query<[string]>("LIVE SELECT * FROM person WHERE verified = NONE");
if (!none.result) throw new Error("Failed to initiate \"NONE\" LQ: " + none.detail);
console.log("MAIN - Uuid is: " + none.result);

console.log("MAIN - Registering \"NONE\" LQ listener");
await db.listenLive(none.result, ({ action, result, detail }) => {
    if (action === 'CLOSE') {
        console.log("NONE - LQ is closed:", detail);
    } else if (action === 'DELETE') {
        console.log(`NONE - !! ${action} ${result}`);
    } else {
        console.log(`NONE - !! ${action} ${result.id} WHERE verified = ${result.verified ? 'true' : 'false'}`);
    }
});



///////////////////////////////////
///// STARTING ALT LIVE QUERY /////
///////////////////////////////////

console.log(' ');
console.log("MAIN - Starting ALT live query");
const altq = await db.live(
    'person',
    ({ action, result, detail }) => {
        if (action === 'CLOSE') {
            console.log("ALTQ - LQ is closed:", detail);
        } else if (action === 'DELETE') {
            console.log(`ALTQ - !! ${action} ${result}`);
        } else {
            console.log(`ALTQ - !! ${action} ${result.id} WHERE verified = ${result.verified ? 'true' : 'false'}`);
        }
    }
)
    .catch((e) => {
        throw new Error("Failed to initiate ALT LQ: " + e);
    })

console.log("MAIN - ALTQ Uuid is: " + lq.result);



await timeout();

///////////////////////////////////
////// CREATING SOME PEOPLE ///////
///////////////////////////////////

console.log(' ');
console.log('MAIN - Create verified person:john');
await db.create('person:john', {
    verified: true
});

console.log('MAIN - Create unverified person:mary');
await db.create('person:mary', {
    verified: false
});



await timeout();

///////////////////////////////////
////// UPDATING SOME PEOPLE ///////
///////////////////////////////////

console.log(' ');
console.log('MAIN - Unverifying person:john');
await db.update('person:john', {
    verified: false
});

console.log('MAIN - Verifying person:mary');
await db.update('person:mary', {
    verified: true
});



await timeout();

///////////////////////////////////
/////// DELETING ALL PEOPLE ///////
///////////////////////////////////

console.log(' ');
console.log('MAIN - Deleting every person');
await db.delete('person');



await timeout();

///////////////////////////////////
/////// CLOSING CONNECTION ////////
///////////////////////////////////

console.log(' ');
console.log("MAIN - Killing LQ");
await db.kill(lq.result);
console.log("MAIN - Killing ALT LQ");
await db.kill(altq);
console.log("MAIN - Killing \"NONE\" LQ");
await db.kill(none.result);

console.log(' ');
console.log("MAIN - Closing connection");
await db.close();

console.log('MAIN - Done!');
console.log(' ');

async function timeout() {
    await new Promise(r => setTimeout(r, 1000));
}