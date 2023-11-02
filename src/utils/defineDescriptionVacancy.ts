import { Page } from 'puppeteer'

export const defineDescriptionVacancy = async (page: Page) => {
  const regexLeavingLettersAndNumbers = /[^\а-яА-ЯёЁ0-9a-zA-Z]/g
  let desc = ''

  const titleVacancySelector = await page.$('[data-qa="vacancy-description"]')

  if (titleVacancySelector) {
    desc = await page.$eval(
      '[data-qa="vacancy-description"]',
      (elem) => elem.innerHTML
    )

    return desc
      .replace(regexLeavingLettersAndNumbers, ' ')
      .replace(/  +/g, ' ')
      .trim()
  }

  return desc
}
