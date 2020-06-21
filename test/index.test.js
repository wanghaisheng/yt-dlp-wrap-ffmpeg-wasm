const assert = require("assert");
const fs = require("fs");
const os = require("os");

const YoutubeDlWrap = require("..");
const youtubeDlWrap = new YoutubeDlWrap();

const isValidVersion = (version) => !isNaN( Date.parse( version.substring(0, 10).replace(/\./g, "-") ) )


describe("fetching data from github", function()
{
    describe("fetching release data", function()
    {
        it("should return an array with 1 release object", async function()
        {
            let releaseData = await YoutubeDlWrap.getGithubReleases(1, 1);
            assert.equal(releaseData.length, 1);
            assert(isValidVersion(releaseData[0].tag_name));
        });
    });

    describe("downloading youtube-dl binary", function()
    {
        it("should create a file", async function()
        {
            await YoutubeDlWrap.downloadYoutubeDl();
            let fileName = os.platform() == "win32" ? "youtube-dl.exe" : "youtube-dl";
            assert(fs.existsSync("./" + fileName));
            const stats = fs.statSync("./" + fileName);
            fs.unlinkSync("./" + fileName);
            assert(stats.size > 0);
        });
    });
});

describe("event emitter function", function()
{
    it("should download a video", function(done)
    {
        let youtubeDlEventEmitter = youtubeDlWrap.exec(["https://www.youtube.com/watch?v=C0DPdy98e4c",
            "-f", "worst", "-o", "test/testVideo.mp4"]);
        let progressDefined = true;
        youtubeDlEventEmitter.on("progress", (progressObject) => 
        {
            if(progressObject.percent == undefined      || progressObject.totalSize == undefined ||
               progressObject.currentSpeed == undefined || progressObject.eta == undefined )
               progressDefined = false;

        });
        youtubeDlEventEmitter.on("close", (code) => 
        {
            assert(fs.existsSync("test/testVideo.mp4"));
            const stats = fs.statSync("test/testVideo.mp4");
            fs.unlinkSync("test/testVideo.mp4");
            assert.equal(stats.size, 552999);
            assert(progressDefined);
            assert.equal(code, 0);
            done();
        });
    });    
});

describe("stream function", function()
{
    it("should download a video", function(done)
    {
        let stdoutReadstream = youtubeDlWrap.execStream(["https://www.youtube.com/watch?v=C0DPdy98e4c",
            "-f", "worst"]);
        stdoutReadstream.pipe(fs.createWriteStream("test/testVideoStream.mp4"));
        stdoutReadstream.on("close", () => 
        {
            assert(fs.existsSync("test/testVideoStream.mp4"));
            const stats = fs.statSync("test/testVideoStream.mp4");
            fs.unlinkSync("test/testVideoStream.mp4");
            assert.equal(stats.size, 552999);
            done();
        });
    });    
});

describe("promise functions", function()
{
    describe("video Info", function ()
    {
        it("should have title Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film", async function()
        {
            let videoInfo = await youtubeDlWrap.getVideoInfo("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
            assert.equal(videoInfo.title, "Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film");
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
            assert.equal(typeof userAgentString, "string");
            assert(userAgentString.length >= 10);
        });
    });
    
    describe("help", function()
    {
        it("should include explanation for version setting", async function()
        {
            let helpString = await youtubeDlWrap.getHelp();
            assert.equal(typeof helpString, "string");
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
        it("should include YouTube.com channels", async function()
        {
            let extractorList = await youtubeDlWrap.getExtractorDescriptions();
            assert(Array.isArray(extractorList));
            assert(extractorList.includes("YouTube.com channels"));
        });
    });
});