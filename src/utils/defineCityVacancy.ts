import { Page } from 'puppeteer'
import { cityTo } from 'lvovich'

export const defineCityVacancy = async (page: Page) => {
  const regex = /[^\а-яА-ЯёЁ_\-]/g
  let city

  const viewLocationSelector = await page.$('[data-qa="vacancy-view-location"]')

  if (viewLocationSelector) {
    city = await page.$eval(
      '[data-qa="vacancy-view-location"]',
      (elem) => elem.innerHTML
    )

    return cityTo(city.split(regex)[0])
  }

  const viewRawAddressSelector = await page.$(
    '[data-qa="vacancy-view-raw-address"]'
  )

  if (viewRawAddressSelector) {
    city = await page.$eval(
      '[data-qa="vacancy-view-raw-address"]',
      (elem) => elem.innerHTML
    )

    return cityTo(city.split(regex)[0])
  }
}
