Server bug
==========

30 Jan 2024

Symptoms
--------

- Calls to preview server fail with Internal server error when using app in preview window

Initial Observations
--------------------

- Errors preceded by different strange errors
- Reinstalled extension with extra logging
- Some errors from build about node and npm versions
- Very first function invocation crashed with a different error about Duplexify/stream-shift
- This is after attempting to fetch server app file and serverRuntime.cjs from cache
- Server function log prints path of serverRuntime.cjs and line 17
- Then prints start of that line
- Then throws error with SyntaxError: Invalid Unicode escape sequence     at internalCompileFunction (node:internal/vm:77:18)
- Function execution times very short - probably not even started to run
- File in preview server cache is new and identical to one on elemento.online
- File on elemento.online was updated Thursday morning 9am - would imagine I have used it since then, although started planning on Fri am
- Running server runtime through node compiles fine on local machine
- Letting server function instance be terminated and restarting gives same failure on startup as before
- Re-saving from Firebase tool succeeds and extension status ok
- Expanding the long line does show a unicode value of u7C at the end - looks too short
- Finding same line in downloaded copy of serverRuntime.cjs shows the line is longer
- SO the file has been cut off while being downloaded from storage and only part-saved to the file cache in the cloud function instance
- This happens consistently on different cloud function instances
- Full stack trace of original error:
 TypeError: Cannot read properties of null (reading 'length')
  at getStateLength (/workspace/node_modules/stream-shift/index.js:16:28)
  at shift (/workspace/node_modules/stream-shift/index.js:6:99)
  at Duplexify._forward (/workspace/node_modules/duplexify/index.js:170:35)
  at PassThrough.onreadable (/workspace/node_modules/duplexify/index.js:136:10)
  at PassThrough.emit (node:events:518:28)
  at PassThrough.emit (node:domain:551:15)
  at emitReadable_ (node:internal/streams/readable:832:12)
  at process.processTicksAndRejections (node:internal/process/task_queues:81:21)
- From seeing a similar stack trace in test, this is from cloud storage code


Things to try
-------------

- Install extension in a new project
- Update Elemento runtime
- Check node versions
- Remove file from storage - although seems to rewrite it regularly anyway

Questions
---------
- Has something changed in the way cloud functions are built in extensions?
- Has something changed in cloud function running?
- Why does the first run work?
- Is serverRuntime.cjs being rewritten while the function is running? - No, the timestamp is still its first download

Further observations
--------------------

- After installing extension in a new project, it all worked again - for a while
- After a pause, next call seemed to hit a similar (but not identical) problem
- First got crash leading to internal server error
- Then got response from my app - this time Unexpected end of input
- In logs, same error on first call to new function instance
- Dump of line from serverRuntime.cjs showed it was truncated in a slightly different place, so parser gave a different error
- If delete serverRuntime.cjs from storage, try call, it is handled by new function instance, get Error: File not found in cache: preview/server/serverRuntime.cjs
  - because it is updated by each PUT of a new version
- If update app to cause server runtime to be re-downloaded, next call works, and one after - in same function instance
- Let that instance die, try call again - fails in same way - a different syntax error again

Resolution
----------

- Change preview server to download server runtime directly when needed
- On further searching, same error reported here: https://zenn.dev/fromkk/articles/0b678dc27ded84
- Which refers to https://stackoverflow.com/questions/77872930/google-cloud-bucket-file-download-nodejs-file-exists-but-readable-throws-erro
- And this https://github.com/googleapis/nodejs-storage/issues/2368#issuecomment-1909718054
- Which shows it is not my problem and a known bug
- Also shows that Cloud Run can change your environment under your feet, introducing bugs suddenly

