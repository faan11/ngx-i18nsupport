import {XliffMerge} from './xliff-merge';
import {ProgramOptions, IConfigFile} from './i-xliff-merge-options';
import {CommandOutput} from '../common/command-output';
import {WriterToString} from '../common/writer-to-string';

/**
 * Created by martin on 18.02.2017.
 * Testcases for XliffMerge.
 */

describe('XliffMerge test spec', () => {

    describe('test the tooling used in the tests', () => {
        it('should write output to string (Test WriterToString)', () => {
            const ws: WriterToString = new WriterToString();
            ws.write('test test test\n');
            ws.write('line 2');
            expect(ws.writtenData()).toContain('line 2');
        });
    });

    describe('command line and configuration checks', () => {
        it('should parse -v option', () => {
            const options: ProgramOptions = XliffMerge.parseArgs(['node', 'xliffmerge', '-v']);
            expect(options.verbose).toBeTruthy();
            expect(options.quiet).toBeFalsy();
        });

        it('should parse -q option', () => {
            const options: ProgramOptions = XliffMerge.parseArgs(['node', 'xliffmerge', '-q']);
            expect(options.quiet).toBeTruthy();
            expect(options.verbose).toBeFalsy();
        });

        it('should output version and used parameters when called with defaults and verbose flag', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = new XliffMerge(commandOut, {verbose: true});
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('xliffmerge version');
            expect(ws.writtenData()).toContain('Used Parameters:');
            done();
        });

        it('should not output version and used parameters when called with defaults and both verbose and quiet flag', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = new XliffMerge(commandOut, {verbose: true, quiet: true});
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('xliffmerge version');
            expect(ws.writtenData()).not.toContain('Used Parameters:');
            done();
        });

        it('should output an errror (no languages) when called with defaults', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = new XliffMerge(commandOut, {});
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('no languages specified');
            done();
        });

        it('should output an errror (i18nfile) when called with defaults', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = new XliffMerge(commandOut, {languages: ['de', 'en']});
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('i18nFile');
            done();
        });

        it('should output an errror (could not read) when called with a non existing profile', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = new XliffMerge(commandOut, {verbose: true, profilePath: 'lmaa'});
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('could not read profile');
            done();
        });

        it('should read test config file', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = XliffMerge.createFromOptions(
                commandOut,
                {profilePath: './test/testdata/xliffmergeconfig.json', verbose: true},
                null);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('languages:\tde,en');
            expect(ws.writtenData()).toContain('srcDir:\t"test');
            expect(ws.writtenData()).toContain('genDir:\t"test');
            done();
        });

        it('should use package.json if no other config file given', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, null);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('usedProfilePath:\t"package.json"');
            done();
        });

        it('should output an errror (srcDir not readable) when called with a non existing srcDir', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    srcDir: 'lmaa',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('srcDir "lmaa" is not a directory');
            done();
        });

        it('should output an errror (genDir not existing) when called with a non existing genDir', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    genDir: 'lmaa',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('genDir "lmaa" is not a directory');
            done();
        });

        it('should output an errror (i18nFile is not readable) when called with a non existing master file', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    srcDir: 'test/testdata',
                    i18nFile: 'nonexistingmaster.xlf'
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('i18nFile "test/testdata/nonexistingmaster.xlf" is not readable');
            done();
        });

        it('should output an errror (language not valid) when called with an invalid language code', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    defaultLanguage: 'de/ch',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('language "de/ch" is not valid');
            done();
        });

        it('should accept en_US (with underscore) as a valid language code (#59)', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    defaultLanguage: 'en_US',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('language "en_US" is not valid');
            done();
        });

        it('should output an errror (i18nFormat invalid) when called with an invalid i18n format', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    i18nFormat: 'unknown',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('i18nFormat "unknown" invalid');
            done();
        });

        it('should output an error when autotranslate is set to true and there is no api key set', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    autotranslate: true,
                    apikey: '',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('autotranslate requires an API key');
            done();
        });

        it('should output an error when autotranslate is set to a list of languages and there is no api key set', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    autotranslate: ['de'],
                    apikey: '',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('autotranslate requires an API key');
            done();
        });

        it('should read api key from file if apikeyfile is set', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    autotranslate: ['de'],
                    apikeyfile: 'package.json',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('apikeyfile:\tpackage.json');
            expect(ws.writtenData()).toContain('apikey:\t****');
            done();
        });

        it('should output an error when autotranslate language is not in list of languages', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['en', 'ru'],
                    autotranslate: ['de'],
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('autotranslate language "de" is not in list of languages');
            done();
        });

        it('should output an error when autotranslate language is set to default language', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['en', 'ru'],
                    autotranslate: ['en', 'ru'],
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).toContain('autotranslate language "en" cannot be translated, because it is the source language');
            done();
        });

        it('should not output error ".. because it is the source language"' +
            ' when autotranslate language is not set to default language (issue #52)', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    defaultLanguage: 'zh-CN',
                    languages: ['en', 'ja'],
                    autotranslate: ['en', 'ja'],
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR');
            expect(ws.writtenData()).not.toContain('autotranslate language "en" cannot be translated, because it is the source language');
            done();
        });

        it('should accept i18n format xlf', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    i18nFormat: 'xlf',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('i18nFormat');
            done();
        });

        it('should accept i18n format xlf2', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    i18nFormat: 'xlf2',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('i18nFormat');
            done();
        });

        it('should accept i18n format xmb', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    i18nFormat: 'xmb',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('i18nFormat');
            done();
        });

        it('should read languages from config file', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('languages:\tde,en,fr');
            expect(ws.writtenData()).toContain('outputFile[de]:	messages.de.xlf');
            expect(ws.writtenData()).toContain('outputFile[en]:	messages.en.xlf');
            expect(ws.writtenData()).toContain('outputFile[fr]:	messages.fr.xlf');
            done();
        });

        it('should accept i18nBaseFile', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    i18nBaseFile: 'custom_file',
                    languages: ['de', 'en', 'fr']
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('i18nBaseFile:	"custom_file"');
            expect(ws.writtenData()).toContain('i18nFile:	"custom_file.xlf"');
            expect(ws.writtenData()).toContain('outputFile[de]:	custom_file.de.xlf');
            expect(ws.writtenData()).toContain('outputFile[en]:	custom_file.en.xlf');
            expect(ws.writtenData()).toContain('outputFile[fr]:	custom_file.fr.xlf');
            expect(ws.writtenData()).toContain('i18nFile "custom_file.xlf" is not readable');
            done();
        });

        it('should find syntax error "duplicate @@" in ngxTranslateExtractionPattern', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    supportNgxTranslate: true,
                    ngxTranslateExtractionPattern: '@@|@@',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR: ngxTranslateExtractionPattern');
            expect(ws.writtenData()).toContain('extraction pattern must not contain @@ twice');
            done();
        });

        it('should find syntax error "invalid description pattern" in ngxTranslateExtractionPattern', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    supportNgxTranslate: true,
                    ngxTranslateExtractionPattern: '@@|ng;',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('ERROR: ngxTranslateExtractionPattern');
            expect(ws.writtenData()).toContain('description pattern must be an identifier containing only letters, digits, _ or -');
            done();
        });

        it('should accept valid ngxTranslateExtractionPattern', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    supportNgxTranslate: true,
                    ngxTranslateExtractionPattern: '@@|ngx-translate|x',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR: ngxTranslateExtractionPattern');
            done();
        });

        it('should output default pattern when verbose and ngxTranslateSupport activated', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    supportNgxTranslate: true
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).not.toContain('ERROR: ngxTranslateExtractionPattern');
            expect(ws.writtenData()).toContain('* ngxTranslateExtractionPattern:\t@@|ngx-translate');
            done();
        });

        it('should accept targetPraefix and targetSuffix parameter', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    targetPraefix: '%%',
                    targetSuffix: '!!',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('* targetPraefix:\t"%%"');
            expect(ws.writtenData()).toContain('* targetSuffix:\t"!!"');
            done();
        });

        it('should output a warning when targetPraefix or targetSuffix are set, but useSourceAsTarget is disabled', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ["de"],
                    useSourceAsTarget: false,
                    targetPraefix: '%%',
                    targetSuffix: '!!',
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            const allWarnings = xliffMergeCmd.warnings().join('\n');
            expect(allWarnings).toContain('configured targetPraefix "%%" will not be used because "useSourceAsTarget" is disabled');
            expect(allWarnings).toContain('configured targetSuffix "!!" will not be used because "useSourceAsTarget" is disabled');
            done();
        });

        it('should accept beautifyOutput flag set to true', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    beautifyOutput: true,
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('* beautifyOutput:\ttrue');
            done();
        });

        it('should accept beautifyOutput flag set to false', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                    beautifyOutput: false,
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('* beautifyOutput:\tfalse');
            done();
        });

        it('should use default false for beautifyOutput flag', (done) => {
            const ws: WriterToString = new WriterToString();
            const commandOut = new CommandOutput(ws);
            const profileContent: IConfigFile = {
                xliffmergeOptions: {
                    languages: ['de', 'en', 'fr'],
                }
            };
            const xliffMergeCmd = XliffMerge.createFromOptions(commandOut, {verbose: true}, profileContent);
            xliffMergeCmd.run();
            expect(ws.writtenData()).toContain('* beautifyOutput:\tfalse');
            done();
        });

    });

});
