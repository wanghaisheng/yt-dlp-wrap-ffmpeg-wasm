# youtube-dl-wrap

![](https://github.com/ghjbnm/youtube-dl-wrap/workflows/CI%20tests/badge.svg)
<a href="https://npmjs.org/package/youtube-dl-wrap" title="View this project on NPM"><img src="https://img.shields.io/npm/v/youtube-dl-wrap.svg" alt="NPM version" /></a>

A simple node.js wrapper for [youtube-dl](https://github.com/ytdl-org/youtube-dl).

* 0 dependencies
* EventEmitter, Promise and Stream interface
* Progress events
* Utility functions

## Usage

Youtube-dl will not be automatically downloaded.\
Provide it yourself or use some of the following functions to download the binary.

```javascript
const YoutubeDlWrap = require("youtube-dl-wrap");

//Get the data from the github releases API. In this case get page 1 with a maximum of 5 items.
let githubReleasesData = await YoutubeDlWrap.getGithubReleases(1, 5);

//Download the youtube-dl binary for the given version and platform to the provided path.
//By default the latest version will be downloaded to "./youtube-dl" and platform = os.platform().
await YoutubeDlWrap.downloadFromGithub("path/to/youtube-dl/binary", "2020.06.16.1", "win32");

//Same as above but always downloads the latest version from the youtube-dl website.
await YoutubeDlWrap.downloadFromWebsite("path/to/youtube-dl/binary", "win32");

//Init an instance with a given binary path.
//If none is provided "youtube-dl" will be used as command.
const youtubeDlWrap = new YoutubeDlWrap("path/to/youtube-dl/binary");
//The binary path can also be changed later on.
youtubeDlWrap.setBinaryPath("path/to/another/youtube-dl/binary");
```


To interface with youtube-dl the following methods can be used.

```javascript
const YoutubeDlWrap = require("youtube-dl-wrap");
const youtubeDlWrap = new YoutubeDlWrap("path/to/youtube-dl/binary");

//Execute and return an EventEmitter
let youtubeDlEmitter = youtubeDlWrap.exec(["https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "-f", "best", "-o", "output.mp4"])
  .on("progress", (progress) => 
    console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
//Exposes all youtube-dl events, for example:
//[download] Destination: output.mp4 -> eventType = download and eventData = Destination: output.mp4
  .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData));
  .on("error", (error) => console.error(error))
  .on("close", () => console.log("all done"));

//Exposes the spawned child process
youtubeDlEmitter.youtubeDlProcess


//Execute and return a Readable Stream. The emitted events are the same as above.
let readableStream = youtubeDlWrap.execStream(["https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "-f", "best"])

//Execute and return a Promise
await youtubeDlWrap.execPromise(["https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "-f", "best", "-o", "output.mp4"]);

//Get the --dump-json metadata as object
let metadata = await youtubeDlWrap.getVideoInfo("https://www.youtube.com/watch?v=aqz-KE-bpKQ");


//Get the version
let version = await youtubeDlWrap.getVersion();

//Get the user agent
let userAgent = await youtubeDlWrap.getUserAgent();

//Get the help output
let help = await youtubeDlWrap.getHelp();

//Get the extractor list
let extractors = await youtubeDlWrap.getExtractors();

//Get the extractor description list
let extractorDescriptions = await youtubeDlWrap.getExtractorDescriptions();
```

## License
MIT
