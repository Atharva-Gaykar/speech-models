const fs = require("fs");
const https = require("https");

const BASE_URL =
    "https://huggingface.co/Gaykar/Speech-onnx-models/resolve/main";


// ============================================
// DOWNLOAD FUNCTION
// ============================================

function download(url, output) {
    return new Promise((resolve, reject) => {

        // Make sure output folder exists
        const outputDir = require("path").dirname(output);

        if (outputDir !== ".") {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const file = fs.createWriteStream(output);

        const makeRequest = (targetUrl) => {

            https.get(targetUrl, (response) => {

                console.log(`${response.statusCode} ${targetUrl}`);

                // Handle redirects
                if ([301, 302, 307, 308].includes(response.statusCode)) {

                    let redirectUrl = response.headers.location;

                    if (redirectUrl) {

                        if (redirectUrl.startsWith("/")) {
                            redirectUrl =
                                `https://huggingface.co${redirectUrl}`;
                        }

                        makeRequest(redirectUrl);
                        return;
                    }
                }

                // Handle failed request
                if (response.statusCode !== 200) {

                    file.close();

                    fs.unlink(output, () => {});

                    reject(
                        new Error(
                            `Download failed: ${response.statusCode}`
                        )
                    );

                    return;
                }

                // Download file
                response.pipe(file);

                file.on("finish", () => {

                    file.close();

                    console.log(
                        `Downloaded successfully: ${output}`
                    );

                    resolve();
                });

            }).on("error", (error) => {

                file.close();

                fs.unlink(output, () => {});

                reject(error);
            });
        };

        makeRequest(url);
    });
}


// ============================================
// LANGUAGE MODEL DOWNLOADER
// ============================================

async function downloadModels(language) {

    console.log(`\nSelected language: ${language}\n`);

    const files = [

        // STT model
        {
            url:
                `${BASE_URL}/stt/${language}/${language}_model.int8.onnx`,

            output:
                `./models/stt/${language}/${language}_model.int8.onnx`
        },

        // STT tokens
        {
            url:
                `${BASE_URL}/stt/${language}/tokens.txt`,

            output:
                `./models/stt/${language}/tokens.txt`
        },

        // TTS model
        {
            url:
                `${BASE_URL}/tts/model.onnx`,

            output:
                `./models/tts/model.onnx`
        },

        // TTS tokens
        {
            url:
                `${BASE_URL}/tts/tokens.txt`,

            output:
                `./models/tts/tokens.txt`
        }
    ];


    try {

        for (const file of files) {

            await download(
                file.url,
                file.output
            );
        }

        console.log(
            `\nAll ${language} STT + TTS files downloaded successfully.`
        );

    } catch (error) {

        console.error(
            "\nExecution halted due to download error:",
            error
        );
    }
}


// ============================================
// SELECT LANGUAGE
// ============================================

// Example:
const selectedLanguage = "ne";

downloadModels(selectedLanguage);
