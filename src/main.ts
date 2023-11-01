import puppeteer, { Page } from 'puppeteer'
import inquirer from 'inquirer'
import { showListAuthVariants } from './utils/showListAuthVariants.js'
import chalk from 'chalk'
import { Mutex } from 'async-mutex'
const mutex = new Mutex()
;(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/usr/bin/google-chrome-stable'
    })

    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    )
    await page.setViewport({ width: 1920, height: 1080 })

    await page.goto('https://hh.ru/', {
      timeout: 100000,
      waitUntil: 'networkidle2'
    })

    const loginBtn = await page.$('[data-qa="login"]')

    await loginBtn?.click()

    await page.waitForNavigation({
      waitUntil: 'networkidle2'
    })

    const authMethod = await showListAuthVariants()

    //логика аутентификации
    if (authMethod === 'Google') {
      const googleAuthBtn = await page.$(
        '[data-qa="account-login-social-gplus"]'
      )

      if (!googleAuthBtn) {
        console.info(
          chalk.red(
            'Произошла ошибка. Попробуйте позже или обратитесь к администратору.'
          )
        )
      } else {
        await googleAuthBtn.click()
        await page.waitForNavigation({
          waitUntil: 'networkidle2'
        })

        const { googleAuthVariant } = await inquirer.prompt([
          {
            type: 'input',
            name: 'googleAuthVariant',
            message: chalk.bgGreen(
              'Введите email или номер телефона для google-аутентификации'
            )
          }
        ])

        //TODO обработать валидацию

        await page.focus('[name="identifier"]')
        await page.keyboard.type(googleAuthVariant)

        const googleBtnNext = await page.$('#identifierNext > div > button')

        await googleBtnNext?.click()
        await page.waitForNavigation({
          waitUntil: 'networkidle2'
        })

        //TODO доделать логику с гуглом (не пускает дальше ввода email)
      }
    } else if (authMethod === 'Phone number') {
      // ввоод номера телефона
      const { enterPhoneNumber } = await inquirer.prompt([
        {
          type: 'input',
          name: 'enterPhoneNumber',
          message: chalk.bgGreen('Введите номер телефона')
        }
      ])

      await page.focus('[data-qa="account-signup-email"]')
      await page.keyboard.type(enterPhoneNumber)

      const phoneNumberAuthBtnNext = await page.$(
        '[data-qa="account-signup-submit"]'
      )

      await phoneNumberAuthBtnNext?.click()

      const captchaInput = await page.$('[data-qa="account-captcha-input"]')
      const codeInput = await page.$('[data-qa="otp-code-input"]')

      console.log(captchaInput, codeInput)

      if (captchaInput) {
        // ввоод каптчи
        const { enterPhoneCaptcha } = await inquirer.prompt([
          {
            type: 'input',
            name: 'enterPhoneCaptcha',
            message: chalk.bgGreen(
              'Скрин с каптчей отправлен в телеграм бот. Введите её здесь'
            )
          }
        ])

        await page.focus('[data-qa="account-captcha-input"]')
        await page.keyboard.type(enterPhoneCaptcha)

        const phoneNumberAuthCaptchaBtn = await page.$(
          '[data-qa="account-signup-submit"]'
        )

        await phoneNumberAuthCaptchaBtn?.click()

        // ввоод кода
        const { enterPhoneCode } = await inquirer.prompt([
          {
            type: 'input',
            name: 'enterPhoneCode',
            message: chalk.bgGreen('Введите полученный на телефон код')
          }
        ])

        await page.focus('[data-qa="otp-code-input"]')
        await page.keyboard.type(enterPhoneCode)

        const phoneNumberAuthFinalBtn = await page.$(
          '[data-qa="otp-code-submit"]'
        )

        await phoneNumberAuthFinalBtn?.click()
        await page.waitForNavigation({
          waitUntil: 'networkidle2'
        })
      }

      if (codeInput) {
        // ввоод кода
        const { enterPhoneCode } = await inquirer.prompt([
          {
            type: 'input',
            name: 'enterPhoneCode',
            message: chalk.bgGreen('Введите полученный на телефон код')
          }
        ])

        await page.focus('[data-qa="otp-code-input"]')
        await page.keyboard.type(enterPhoneCode)

        const phoneNumberAuthFinalBtn = await page.$(
          '[data-qa="otp-code-submit"]'
        )

        await phoneNumberAuthFinalBtn?.click()
        await page.waitForNavigation({
          waitUntil: 'networkidle2'
        })
      }
    } else if (authMethod === 'Email') {
      // ввод номера телефона
      const { enterEmail } = await inquirer.prompt([
        {
          type: 'input',
          name: 'enterEmail',
          message: chalk.bgGreen('Введите email')
        }
      ])

      await page.focus('[data-qa="account-signup-email"]')
      await page.keyboard.type(enterEmail)

      const emailAuthBtnNext = await page.$('[data-qa="account-signup-submit"]')

      await emailAuthBtnNext?.click()

      // ввоод кода
      const { enterEmailCode } = await inquirer.prompt([
        {
          type: 'input',
          name: 'enterEmailCode',
          message: chalk.bgGreen('Введите отправленный на email код')
        }
      ])

      await page.focus('[data-qa="otp-code-input"]')
      await page.keyboard.type(enterEmailCode)

      const emailAuthFinalBtn = await page.$('[data-qa="otp-code-submit"]')

      await emailAuthFinalBtn?.click()
      await page.waitForNavigation({
        waitUntil: 'networkidle2'
      })
    } else {
      console.info(
        chalk.bgRed(
          'Используйте аутентификацию через Google. Остальное пока в разработке'
        )
      )

      await browser.close()

      // обработать рекурсию
      await showListAuthVariants()
    }

    //логика приветствия аутентифицированного пользователя

    await mutex.runExclusive(async () => {
      const profileBtn = await page.$('[data-qa="mainmenu_applicantProfile"]')

      await profileBtn!.click()

      const userNameBlock = await page.$(
        'body > div.bloko-drop.bloko-drop_menu.bloko-drop_theme-light.bloko-drop_layer-overlay.bloko-drop_flexible.bloko-drop_clickable.bloko-drop_bottom > div > div > div.supernova-dropdown > div:nth-child(1) > a > span'
      )

      const spanName = await (await userNameBlock?.getProperty(
        'textContent'
      ))!.jsonValue()

      console.info(chalk.bgRed(`Вы успешно аутентифицированы, как ${spanName}`))
    })

    //логика поиска вакансии

    // текст поиска по вакансиям или компаниям
    const { enterSearchQuery } = await inquirer.prompt([
      {
        type: 'input',
        name: 'enterSearchQuery',
        message: chalk.bgGreen('Введите поисковой запрос')
      }
    ])

    await page.focus('[data-qa="search-input"]')
    await page.keyboard.type(enterSearchQuery)

    const searchVacancyBtn = await page.$('[data-qa="search-button"]')

    await searchVacancyBtn?.click()
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded',
      timeout: 100000
    })

    // логика обхода вакансий

    const blokoHeader = await page.$eval(
      '[data-qa="bloko-header-3"]',
      (elem) => elem.innerHTML
    )

    if (blokoHeader.toLowerCase().includes('ничего не найдено')) {
      //TODO доделать логику повторного поиска вакансий
      console.info(
        chalk.bgRed('Вакансии по такому запросу не найдены. Придумайте другой!')
      )

      return
    }

    const totalCountVacancy = blokoHeader.replace(/[^0-9]/g, '')

    // ввоод кода
    const { selectNumberVacancy } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selectNumberVacancy',
        message: chalk.bgWhite(
          `По вашему запросу найдено ${totalCountVacancy} вакансий. На сколько вакансий откликнуться боту? (Просто нажмите enter и бот откликнется на все)`
        )
      }
    ])

    const targetNumberVacancy =
      selectNumberVacancy === '' ? +totalCountVacancy : +selectNumberVacancy

    console.log(targetNumberVacancy, 'targetNumberVacancy')

    let countPages = await page.$$eval(
      '[data-qa="pager-page"] > span',
      (elems) => {
        return elems.map((elem) => +elem.innerHTML).sort((a, b) => b - a)[0]
      }
    )

    let pageNumber = 1
    let countRespondedVacancy = 0

    const crawlingPages = async () => {
      if (
        pageNumber === countPages + 1 ||
        countRespondedVacancy >= targetNumberVacancy
      ) {
        return
      }

      if (pageNumber !== 1) {
        await mutex.runExclusive(async () => {
          const nextPaginationBtnSelector = `[data-qa="pager-page-wrapper-${
            pageNumber + 1
          }-${pageNumber}"]`

          const nextPaginationBtn = await page.$(nextPaginationBtnSelector)

          await nextPaginationBtn?.click()
          await page.waitForNavigation({
            waitUntil: 'domcontentloaded',
            timeout: 100000
          })
        })
      }

      const vacancyTitles = await page.$$eval(
        '[data-qa="serp-item__title"]',
        (elems) => {
          return elems.map((el) => {
            return el.innerHTML
          })
        }
      )

      const vacancyList = await page.$$(
        '[data-qa="vacancy-serp__vacancy vacancy-serp__vacancy_standard"], [data-qa="vacancy-serp__vacancy vacancy-serp__vacancy_premium"], [data-qa="vacancy-serp__vacancy vacancy-serp__vacancy_standard_plus"]'
      )

      const responseAfterCrowlingOnePage = await Promise.all(
        vacancyList.slice(2, 4).map(async (vacancy) => {
          return await mutex.runExclusive(async () => {
            if (countRespondedVacancy >= targetNumberVacancy) {
              return
            }

            // ищем вакансию на которую не откликались
            const noResponded = await vacancy.$(
              '[data-qa="vacancy-serp__vacancy_response"]'
            )

            if (!noResponded) {
              return {
                status: 'already responded'
              }
            }

            const href = await vacancy.$eval(
              '[data-qa="serp-item__title"]',
              //@ts-ignore
              (el) => el.href
            )

            //создаем новую страницу

            const page2 = await browser.newPage()
            await page2.setViewport({ width: 1920, height: 1080 })
            await page2.bringToFront()
            await page2.goto(href, {
              timeout: 100000,
              waitUntil: 'networkidle2'
            })

            //жмем на откликнуться

            const respondBtn = await page2.$$(
              '[data-qa="vacancy-response-link-top"]'
            )

            if (!respondBtn[0]) {
              await page2.close()
              return {
                status: 'non-standard'
              }
            }

            await respondBtn[0]?.click()

            const waitLetterBtn = await page2.waitForSelector(
              '[data-qa="vacancy-response-letter-toggle"]'
            )

            await new Promise((r) => setTimeout(r, 3000))

            // await page.evaluate((testo) => {
            //     const element = document.querySelector(testo)
            //     if (element) {
            //         element.scrollIntoView()
            //     }
            // }, testo)

            await waitLetterBtn?.click()

            // добавляем сопроводительное

            await page2.evaluate(() => {
              document.querySelector('textarea')!.value =
                'Здравствуйте. Есть большой опыт в данной сфере.'
            })

            const sendLetterBtn = await page2.$(
              '[data-qa="vacancy-response-letter-submit"]'
            )

            await sendLetterBtn?.click()

            await page2.close()

            countRespondedVacancy++

            return {
              status: 'responded'
            }
          })
        })
      )

      // console.log(
      //   responseAfterCrowlingOnePage,
      //   vacancyTitles.slice(0, 5),
      //   `page ${pageNumber}`
      // )

      pageNumber++

      await crawlingPages()
    }

    await crawlingPages()

    console.info(
      chalk.bgMagenta(
        `Успех! Пока вы пили кофе, бот откликнулся за вас на ${countRespondedVacancy} вакансий`
      )
    )
  } catch (err) {
    console.log(err)
  }
})()
