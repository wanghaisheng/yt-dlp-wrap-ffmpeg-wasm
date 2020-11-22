const assert = require("assert");
const fs = require("fs");
const os = require("os");

const YoutubeDlWrap = require("..");
const youtubeDlWrap = new YoutubeDlWrap();

const testVideoPath = "test/testVideo.mp4";
const testVideoId = "C0DPdy98e4c";
const testVideoURL = "https://www.youtube.com/watch?v=" + testVideoId;

const isValidVersion = (version) => !isNaN( Date.parse( version.substring(0, 10).replace(/\./g, "-") ) )

const checkFileDownload = function()
{
    let fileName = os.platform() == "win32" ? "youtube-dl.exe" : "youtube-dl";
    assert(fs.existsSync("./" + fileName));
    const stats = fs.statSync("./" + fileName);
    fs.unlinkSync("./" + fileName);
    assert(stats.size > 0);
}

const checkEventEmitter = function(youtubeDlEventEmitter)
{
    return new Promise((resolve, reject) =>
    {
        let progressDefined = true;
        youtubeDlEventEmitter.on("progress", (progressObject) => 
        {
            if(progressObject.percent == undefined      || progressObject.totalSize == undefined ||
               progressObject.currentSpeed == undefined || progressObject.eta == undefined )
               progressDefined = false;
        });

        let youtubeDlEventFound = false;
        youtubeDlEventEmitter.on("youtubeDlEvent", (eventType, eventData) => 
        {
            if(eventType == "youtube" && eventData.includes(testVideoId))
                youtubeDlEventFound = true;
        });

        youtubeDlEventEmitter.on("error", (error) => reject(error));
        youtubeDlEventEmitter.on("close", () => 
        {
            assert(fs.existsSync(testVideoPath));
            const stats = fs.statSync(testVideoPath);
            fs.unlinkSync(testVideoPath);
            assert.strictEqual(stats.size, 552999);
            assert(progressDefined);
            assert(youtubeDlEventFound);
            resolve();
        });
    });
}

describe("downloading youtube-dl binary", function()
{
    it("should download from github", async function()
    {
        await YoutubeDlWrap.downloadFromGithub();
        checkFileDownload();
    });

    it("should download from youtube-dl website", async function()
    {
        await YoutubeDlWrap.downloadFromWebsite();
        checkFileDownload();
    });
});

describe("event emitter function", function()
{
    it("should download a video", async function()
    {
        let youtubeDlEventEmitter = youtubeDlWrap.exec([testVideoURL, "-f", "worst", "-o", "test/testVideo.mp4"]);
        await checkEventEmitter(youtubeDlEventEmitter);
    });    
});

describe("stream function", function()
{
    it("should download a video", async function()
    {
        let readableStream = youtubeDlWrap.execStream([testVideoURL, "-f", "worst"]);
        readableStream.pipe(fs.createWriteStream(testVideoPath));
        await checkEventEmitter(readableStream);
    });    
});

describe("promise functions", function()
{
    describe("video Info", function ()
    {
        it("should have title Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film", async function()
        {
            let videoInfo = await youtubeDlWrap.getVideoInfo("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
            assert.strictEqual(videoInfo.title, "Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film");
        });
    });

    describe("version", function()
    {
        it("should start with a date", async function()
        {
            let versionString = await youtubeDlWrap.getVersion();
            assert(isValidVersion(versionString));
        });
    });

    describe("user agent", function()
    {
        it("should be a string with at least 10 characters", async function()
        {
            let userAgentString = await youtubeDlWrap.getUserAgent();
            assert.strictEqual(typeof userAgentString, "string");
            assert(userAgentString.length >= 10);
        });
    });
    
    describe("help", function()
    {
        it("should include explanation for version setting", async function()
        {
            let helpString = await youtubeDlWrap.getHelp();
            assert.strictEqual(typeof helpString, "string");
            assert(helpString.includes("--version"));
        });
    });

    describe("extractor list", function()
    {
        it("should include youtube", async function()
        {
            let extractorList = await youtubeDlWrap.getExtractors();
            assert(Array.isArray(extractorList));
            assert(extractorList.includes("youtube"));
        });
    });

    describe("extractor description list", function()
    {
        it("should include YouTube.com playlists", async function()
        {
            let extractorList = await youtubeDlWrap.getExtractorDescriptions();
            assert(Array.isArray(extractorList));
            assert(extractorList.includes("YouTube.com playlists"));
        });
    });
});