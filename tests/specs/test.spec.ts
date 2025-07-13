describe("Google", () => {
    it("Test", async () => {
        await browser.url('https://www.google.com')
        await $('textarea[title="Pesquisar"]').setValue('Test');
        await browser.pause(1000)

        await expect(
            await browser.checkFullPageScreen("Test Image")
        ).toEqual(0)
    })
})