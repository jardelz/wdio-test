export const config: WebdriverIO.Config = {
    specs: ["./tests/specs/*.ts"],
    maxInstances: 1,
    logLevel: "info",
    framework: "mocha",
    runner: 'local',

    services: [
        [
            "visual",
            {
                createJsonReportFiles: true,
                compareOptions: {
                    threshold: 0,
                }
            }
        ]
        
    ],

    mochaOpts: {
        timeout: 60000
    },

capabilities: [{
        browserName: 'chrome',
        acceptInsecureCerts: true,
        ...(process.env.EXAMPLE_RECIPE === 'emulate'
            ? {webSocketUrl: true}
            : {})
    }],
}