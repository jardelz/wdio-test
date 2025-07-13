describe("Google", () => {
    it("Test", async () => {
        await browser.url('https://www.google.com')
        await $('textarea[title="Pesquisar"]').setValue('Test');
        await browser.pause(1000)

        await expect(
            await browser.checkFullPageScreen("Test Image")
        ).toEqual(0)
    })

    it("Test 2", async () => {
        await browser.url('https://www.google.com')
        await $('textarea[title="Pesquisar"]').setValue('Test');
        await browser.pause(1000)

        await expect(
            await browser.checkFullPageScreen("Test Image 2")
        ).toEqual(0)
    })

        it("Test 3", async () => {
        await browser.url('https://www.google.com')
        await $('textarea[title="Pesquisar"]').setValue('Test');
        await browser.pause(1000)

        await expect(
            await browser.checkElement($('textarea[title="Pesquisar"]'), "Test Image 3")
        ).toEqual(0)
    })
})