/**
 * Raw ESM test script. Expects node --experimental-modules
 */

import ZebraTime from "../index";
const zhours = "ABCDEFGHIJKLMNOPQRSTUVWX";

test('default time should have a letter for current hour and show minutes', function() {
    if (/^[ABCDEFGHIJKLMNOPQRSTUVWX]:\d\d$/.test(ZebraTime())) return;
    throw new Error('malformed response '+ZebraTime());
});

test('Setting precision to second should return a result like A:00:00', function() {
    if (/^[ABCDEFGHIJKLMNOPQRSTUVWX]:\d\d:\d\d$/.test(ZebraTime().precision('second'))) return;
    throw new Error('malformed response '+ZebraTime());
});

process.exit(); // success

function test(message,method) {
    try {
        method();
        console.log('\x1b[32m%s\x1b[0m',"✓ "+message);
    } catch(e) {
        console.log(message);
        console.log('\x1b[31m%s\x1b[0m',e.message);
        process.exit(1); // fail
    }
}