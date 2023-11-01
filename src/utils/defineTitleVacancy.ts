import { Page } from 'puppeteer'

export const defineTitleVacancy = async (page: Page) => {
  const regexLeavingLettersAndNumbers = /[^\а-яА-ЯёЁ0-9]/g
  let title = ''

  const titleVacancySelector = await page.$('[data-qa="vacancy-title"]')

  if (titleVacancySelector) {
    title = await page.$eval(
      '[data-qa="vacancy-title"]',
      (elem) => elem.innerHTML
    )

    return title
      .replace(regexLeavingLettersAndNumbers, ' ')
      .replace(/  +/g, ' ')
      .trim()
  }

  return title
}
