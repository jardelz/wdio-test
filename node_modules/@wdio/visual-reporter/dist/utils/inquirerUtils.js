var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { select } from '@inquirer/prompts';
import { join } from 'node:path';
import { listItems } from './fileHandling.js';
import { clearPreviousPromptLines } from './cliUtils.js';
export function chooseItems(_a) {
    return __awaiter(this, arguments, void 0, function* ({ currentPath, includeFiles = false, }) {
        function prompt(srcPath) {
            return __awaiter(this, void 0, void 0, function* () {
                const promptMessage = `Please choose the Visual Testing output.json file (current folder: ${srcPath})`;
                const choices = listItems({ folderPath: srcPath, includeFiles });
                const answers = yield select({
                    message: promptMessage,
                    choices: choices,
                });
                const newPath = join(srcPath, answers);
                if ((answers === '..' || answers.endsWith('/')) &&
                    !answers.startsWith('selected-folder:')) {
                    clearPreviousPromptLines(promptMessage);
                    return prompt(newPath);
                }
                else if (answers.startsWith('selected-folder:')) {
                    return answers.split(':')[1];
                }
                return newPath;
            });
        }
        return prompt(currentPath);
    });
}
