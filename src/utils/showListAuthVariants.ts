import inquirer from 'inquirer'
import { AuthVariantsType } from '../types/types.js'

export const showListAuthVariants = async () => {
    const { authMethod } = await inquirer.prompt([
        {
            type: 'list',
            name: 'authMethod',
            message: 'Authentication method',
            choices: ['VK', 'Email', 'Phone number', 'Google']
        }
    ])

    return authMethod
}
