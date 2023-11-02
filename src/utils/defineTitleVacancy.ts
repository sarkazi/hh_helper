import { Page } from 'puppeteer'

export const defineTitleVacancy = async (page: Page) => {
  const regexLeavingLettersAndNumbers = /[^\а-яА-ЯёЁ0-9a-zA-Z]/g
  let title = ''

  const titleVacancySelector = await page.$('[data-qa="vacancy-title"]')

  if (titleVacancySelector) {
    //@ts-ignore
    title = await page.$eval(
      '[data-qa="vacancy-title"]',
      (elem) => elem.textContent
    )

    title = title
      .replace(regexLeavingLettersAndNumbers, ' ')
      .replace(/  +/g, ' ')
      .trim()

    return title
  }

  return title
}
