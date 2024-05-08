(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// let child_process = require("child_process");
// let { spawn } = child_process;
// function isJSONObject(obj) {
//   try {
//     safeStringify(obj);
//     return obj && typeof obj == "object";
//   } catch (e) {
//     return false;
//   }
// }

// function isPrimitive(obj) {
//   if (obj === null || obj === undefined) return true;
//   return typeof obj !== "object";
// }

// let arg1 = JSON.stringify({
//   body: {
//     template: "uk_dl.docx",
//     stringMap: {
//       SURNAME: "John Doe",
//       DOB: "01/01/1970",
//     },
//     imageMap: {
//       0: 0,
//       1: 1,
//     },
//     files: ["no-image.png", "no-image.png"],
//   },
// });

// // console.log(arg1);

// (async () => {
//   // console.log(await execjs("python docGenerate.py " + arg1 + ""));
//   let res = await execjs(["python", "docGenerate.py", arg1]);
//   console.log(res);
// })();

// function execjs(cmds) {
//   return new Promise((resolve, reject) => {
//     let out = "";
//     let err = "";
//     process = spawn(cmds[0], cmds.slice(1));
//     process.stdout.on("data", (data) => {
//       out += data.toString();
//       // console.log(data.toString());
//     });
//     process.stderr.on("data", (data) => {
//       err += data.toString();
//       console.log("Err", data.toString());
//     });
//     process.on("close", (code) => {
//       // console.log(`child process exited with code ${code}`);
//       if (code == 0) resolve(out.replace(/\n$/, ""));
//       else reject(err);
//     });
//   });
// }


const { generateMrz } = require('mrz-generator');

// const inputData = {
//   passport: {
//     mrzType: 'td3',
//     type: 'p',
//     issuingCountry: 'FRA',
//     number: '11av56868',
//     expirationDate: '11 May 2021 00:00:00 GMT',

//   },
//   user: {
//     surname: 'Gendre',
//     givenNames: 'Pierre Joseh Alexandre',
//     nationality: 'FRA',
//     dateOfBirth: '17 Oct 1986 00:12:00 GMT',
//     sex: 'male'
//   }
// }

// const mrz = generateMrz(inputData)
// console.log(mrz)

window.generateMrz = generateMrz;


},{"mrz-generator":2}],2:[function(require,module,exports){
const { checkInputFormat } = require('./src/services/check-input-format')

const { generateMrzTd1 } = require('./src/formats/td1')
const { generateMrzTd3 } = require('./src/formats/td3')
const {generateMrvB} = require("./src/formats/mrvb");

const generateMrz = data => {
  checkInputFormat(data)
  switch (data.passport.mrzType) {
    case 'td1':
      return generateMrzTd1(data)
    case 'td3':
      return generateMrzTd3(data)
    default:
      return generateMrzTd3(data)
  }
}

const generateMrv = data => {
  checkInputFormat(data)
  switch (data.passport.mrzType) {
    case 'mrvb':
      return generateMrvB(data)
    default:
      return generateMrvB(data)
  }
}

module.exports = { generateMrz, generateMrv }

},{"./src/formats/mrvb":4,"./src/formats/td1":5,"./src/formats/td3":6,"./src/services/check-input-format":8}],3:[function(require,module,exports){
const {
  replaceSubStringAtPositionToUpCase,
  replaceSpecialCharsBySpaces,
  truncateString
} = require('../services/string')
const { checkDigitCalculation } = require('../services/check-digit')
const { stringDateToYYMMDD } = require('../services/date')

const generateDateWithCheckDigit = (line, stringDate, position) => {
  const formatYYMMDD = stringDateToYYMMDD(stringDate)
  line = replaceSubStringAtPositionToUpCase(line, formatYYMMDD, position)
  const digitCheck = checkDigitCalculation(formatYYMMDD)
  return replaceSubStringAtPositionToUpCase(line, digitCheck, position + 6)
}

const generatePassportNumber = (line, passport, position) => {
  line = replaceSubStringAtPositionToUpCase(line, passport.number, position)
  const digitCheck = checkDigitCalculation(passport.number.toUpperCase())
  return replaceSubStringAtPositionToUpCase(line, digitCheck, position + 9)
}

const generatePassportType = (line, passport) => {
  line = replaceSubStringAtPositionToUpCase(line, passport.type, 0)
  if (passport.precisionType) {
    line = replaceSubStringAtPositionToUpCase(line, passport.precisionType, 1)
  }
  return line
}

const generateCountryCode = (line, code, position) =>
  replaceSubStringAtPositionToUpCase(line, code, position)

const generateSex = (line, user, position) =>
  replaceSubStringAtPositionToUpCase(line, user.sex[0].toUpperCase(), position)

const generateSurnameAndGivenNames = (line, user, position, lineLength) => {
  const surname = replaceSpecialCharsBySpaces(user.surname)
  line = replaceSubStringAtPositionToUpCase(line, surname, position)

  const givenNamesPosition = position + user.surname.length + 2
  const givenNamesMaxLength = lineLength - givenNamesPosition
  const givenNames = truncateString(
    replaceSpecialCharsBySpaces(user.givenNames),
    givenNamesMaxLength
  )
  return replaceSubStringAtPositionToUpCase(
    line,
    givenNames,
    givenNamesPosition
  )
}

module.exports = {
  generateDateWithCheckDigit,
  generatePassportNumber,
  generatePassportType,
  generateCountryCode,
  generateSex,
  generateSurnameAndGivenNames
}

},{"../services/check-digit":7,"../services/date":10,"../services/string":11}],4:[function(require,module,exports){
const {
  generateEmptyLine,
  replaceSubStringAtPositionToUpCase,
  replaceSpecialCharsBySpaces,
  truncateString
} = require('../services/string')

const {
  generateDateWithCheckDigit,
  generatePassportNumber,
  generateSex,
  generatePassportType,
  generateCountryCode,
  generateSurnameAndGivenNames
} = require('./common')

const lineLength = 36

const generateMrvB = data =>
  `${_generateLine1(data)}\n${_generateLine2(data)}`

const _generateLine1 = ({ passport, user }) => {
  let line = generateEmptyLine(lineLength)
  line = generatePassportType(line, passport)
  line = generateCountryCode(line, passport.issuingCountry, 2)
  line = generateSurnameAndGivenNames(line, user, 5, lineLength)
  return line
}

const _generateLine2 = ({ passport, user }) => {
  let line = generateEmptyLine(lineLength)
  line = generatePassportNumber(line, passport, 0)
  line = _generateUserNationality(line, user)
  line = _generateDateOfBirth(line, user)
  line = generateSex(line, user, 20)
  line = _generateExpirationDate(line, passport)
  return _generateOptionalField(line, passport)
  //return _generateGlobalDigitCheck(line)
}

const _generateUserNationality = (line, user) =>
  replaceSubStringAtPositionToUpCase(line, user.nationality, 10)

const _generateDateOfBirth = (line, user) =>
  generateDateWithCheckDigit(line, user.dateOfBirth, 13)

const _generateExpirationDate = (line, passport) =>
  generateDateWithCheckDigit(line, passport.expirationDate, 21)

const _generateOptionalField = (line, passport) => {
  let field = truncateString(passport.optionalField1.toUpperCase(), 8)
  field = replaceSpecialCharsBySpaces(field)
  return replaceSubStringAtPositionToUpCase(line, field, 28)
  //const digitCheck = checkDigitCalculation(field)
  //return replaceSubStringAtPositionToUpCase(line, digitCheck, 35)
}

module.exports = { generateMrvB }

},{"../services/string":11,"./common":3}],5:[function(require,module,exports){
const {
  generateEmptyLine,
  replaceSubStringAtPositionToUpCase,
  replaceSpecialCharsBySpaces,
  truncateString
} = require('../services/string')

const {
  generatePassportType,
  generatePassportNumber,
  generateSex,
  generateCountryCode,
  generateDateWithCheckDigit,
  generateSurnameAndGivenNames
} = require('./common')

const lineLength = 30

const generateMrzTd1 = data =>
  `${_generateLine1(data)}\n${_generateLine2(data)}\n${_generateLine3(data)}`

const _generateLine1 = ({ passport }) => {
  let line = generateEmptyLine(lineLength)
  line = generatePassportType(line, passport)
  line = generateCountryCode(line, passport.issuingCountry, 2)
  line = generatePassportNumber(line, passport, 5)
  line = _generateOptionalField(line, passport.optionalField1, 15, 15)
  return line
}

const _generateLine2 = ({ passport, user }) => {
  let line = generateEmptyLine(lineLength)
  line = generateDateWithCheckDigit(line, user.dateOfBirth, 0)
  line = generateSex(line, user, 7)
  line = generateDateWithCheckDigit(line, passport.expirationDate, 8)
  line = generateCountryCode(line, user.nationality, 15)
  line = _generateOptionalField(line, passport.optionalField2, 18, 11)
  return line
}

const _generateLine3 = ({ user }) => {
  let line = generateEmptyLine(lineLength)
  return generateSurnameAndGivenNames(line, user, 0, lineLength)
}

const _generateOptionalField = (line, value, position, maxLength) => {
  let field = truncateString(value.toUpperCase(), maxLength)
  field = replaceSpecialCharsBySpaces(field)
  return replaceSubStringAtPositionToUpCase(line, field, position)
}

module.exports = { generateMrzTd1 }

},{"../services/string":11,"./common":3}],6:[function(require,module,exports){
const {
  generateEmptyLine,
  replaceSubStringAtPositionToUpCase,
  replaceSpecialCharsBySpaces,
  truncateString
} = require('../services/string')

const { checkDigitCalculation } = require('../services/check-digit')

const {
  generateDateWithCheckDigit,
  generatePassportNumber,
  generateSex,
  generatePassportType,
  generateCountryCode,
  generateSurnameAndGivenNames
} = require('./common')

const lineLength = 44

const generateMrzTd3 = data =>
  `${_generateLine1(data)}\n${_generateLine2(data)}`

const _generateLine1 = ({ passport, user }) => {
  let line = generateEmptyLine(lineLength)
  line = generatePassportType(line, passport)
  line = generateCountryCode(line, passport.issuingCountry, 2)
  line = generateSurnameAndGivenNames(line, user, 5, lineLength)
  return line
}

const _generateLine2 = ({ passport, user }) => {
  let line = generateEmptyLine(lineLength)
  line = generatePassportNumber(line, passport, 0)
  line = _generateUserNationality(line, user)
  line = _generateDateOfBirth(line, user)
  line = generateSex(line, user, 20)
  line = _generateExpirationDate(line, passport)
  line = _generateOptionalField(line, passport)
  return _generateGlobalDigitCheck(line)
}

const _generateUserNationality = (line, user) =>
  replaceSubStringAtPositionToUpCase(line, user.nationality, 10)

const _generateDateOfBirth = (line, user) =>
  generateDateWithCheckDigit(line, user.dateOfBirth, 13)

const _generateExpirationDate = (line, passport) =>
  generateDateWithCheckDigit(line, passport.expirationDate, 21)

const _generateOptionalField = (line, passport) => {
  let field = truncateString(passport.optionalField1.toUpperCase(), 14)
  field = replaceSpecialCharsBySpaces(field)
  line = replaceSubStringAtPositionToUpCase(line, field, 28)
  const digitCheck = checkDigitCalculation(field)
  return replaceSubStringAtPositionToUpCase(line, digitCheck, 42)
}

const _generateGlobalDigitCheck = line => {
  let stringToBeChecked =
    line.slice(0, 10) + line.slice(13, 20) + line.slice(21, 43)
  const digitCheck = checkDigitCalculation(stringToBeChecked)
  return replaceSubStringAtPositionToUpCase(line, digitCheck, 43)
}

module.exports = { generateMrzTd3 }

},{"../services/check-digit":7,"../services/string":11,"./common":3}],7:[function(require,module,exports){
const checkDigitCalculation = inputString => {
  if (!_doesStringFitToFormat(inputString))
    throw new Error('Check Digit : Input string does not match required format')
  const arrayOfChars = _stringIntoArrayOfChars(inputString)
  const arrayOfNumbers = _arrayOfCharIntoArrayOfNumber(arrayOfChars)
  const weightedSum = _computeWeightedSum(arrayOfNumbers)
  return String(weightedSum % 10)
}

// Formatting / mapping --
// Example of mathing string: 'EREFGRE45<<<<ER'
const _doesStringFitToFormat = inputString =>
  new RegExp(/^([A-Z]|[0-9]|<)*$/g).test(inputString)

const _stringIntoArrayOfChars = str => str.split('')

const _arrayOfCharIntoArrayOfNumber = arr =>
  arr.map(chr =>
    _isCharANumber(chr) ? Number(chr) : _convertCharIntoNumber(chr)
  )

const _convertCharIntoNumber = chr => (chr === '<' ? 0 : chr.charCodeAt(0) - 55)

const _isCharANumber = chr => Number(chr) == chr

// Calculation --
const _computeWeightedSum = arrayOfNumbers => {
  let result = 0
  const weights = [7, 3, 1]
  arrayOfNumbers.forEach((value, i) => {
    result += weights[i % 3] * value
  })
  return result
}

module.exports = { checkDigitCalculation }

},{}],8:[function(require,module,exports){
const countryCodes = require('./data/country-codes')

const checkInputFormat = ({ passport, user }) => {
  _setDefaultValuesToUndefinedFields({ passport, user })
  _checkPassportInput(passport)
  _checkUserInput(user)
}

const _setDefaultValuesToUndefinedFields = ({ passport }) => {
  if (!passport.optionalField1) passport.optionalField1 = ''
  if (!passport.optionalField2) passport.optionalField2 = ''
}

const _checkPassportInput = passport => {
  _testAndThrowException(
    _isMrzTypeValid(passport.mrzType),
    'Mrz type is not valid.'
  )

  _testAndThrowException(
    _isALetter(passport.type),
    'Passport type must be a letter.'
  )

  _testAndThrowException(
    _isAValidPrecisionOfType(passport.typePrecision),
    'Second letter for passport type is not valid.'
  )

  _testAndThrowException(
    _isAValidPassportNumber(passport.number),
    'Passport number is not valid.'
  )
  _testAndThrowException(
    _isCountryCodeValid(passport.issuingCountry),
    'Passport issuing country is not a valid ISO 3166 code.'
  )

  _testAndThrowException(
    _isAnAlphaNumericString(passport.number) || passport.number.length !== 9,
    'Passport number does not match the required format.'
  )

  _testAndThrowException(
    _isAnAlphaNumericStringOrEmpty(passport.optionalField1),
    'Optional field 1 must be an alphanumeric string.'
  )

  _testAndThrowException(
    _isAnAlphaNumericStringOrEmpty(passport.optionalField2),
    'Optional field 2 must be an alphanumeric string.'
  )

  _testAndThrowException(
    !(passport.optionalField2 !== '' && passport.mrzType === 'td3'),
    'Second optional field is not available for TD3 format.'
  )
  _testAndThrowException(
    _isDateFormatValid(passport.expirationDate),
    'Passport expiration date is not valid.'
  )
}

const _checkUserInput = user => {
  _testAndThrowException(
    _isNameFormatValid(user.surname),
    'Surname does not match required format.'
  )

  _testAndThrowException(
    _isNameFormatValid(user.givenNames),
    'Given names do not match required format.'
  )
  _testAndThrowException(
    _isDateFormatValid(user.dateOfBirth),
    "User's date of birth is not valid."
  )

  _testAndThrowException(_isSexValid(user.sex), "User's sex is not valid.")
}

const _testAndThrowException = (testToValidate, errorMessage) => {
  if (!testToValidate) {
    throw new Error(errorMessage)
  }
}

const _isAnAlphaNumericString = str => new RegExp(/^[a-zA-Z0-9]+$/g).test(str)

const _isAnAlphaNumericStringOrEmpty = str =>
  str === '' || _isAnAlphaNumericString(str)

const _isALetter = chr => new RegExp(/^[a-zA-Z]$/g).test(chr)

const _isAValidPassportNumber = number =>
  new RegExp(/^[a-zA-Z0-9]/g).test(number)

const _isAValidPrecisionOfType = (chr, mzrType) =>
  chr === undefined ||
  (_isALetter(chr) && (mzrType === 'td3' || chr.toUpperCase() !== 'V'))

const _isMrzTypeValid = type => ['td1', 'td3', 'mrvb'].indexOf(type) !== -1

const _isDateFormatValid = stringDate => !isNaN(Date.parse(stringDate))

const _isNameFormatValid = name =>
    name.length > 0 ? new RegExp(/^([a-zA-Z]+[ |-|-|']?)+$/g).test(name) : true

const _isCountryCodeValid = code => countryCodes.indexOf(code) !== -1

const _isSexValid = sex => ['female', 'male', 'unspecified'].indexOf(sex) !== -1

module.exports = { checkInputFormat }

},{"./data/country-codes":9}],9:[function(require,module,exports){
module.exports=[
  "ABW",
  "AFG",
  "AGO",
  "AIA",
  "ALA",
  "ALB",
  "AND",
  "ARE",
  "ARG",
  "ARM",
  "ASM",
  "ATA",
  "ATF",
  "ATG",
  "AUS",
  "AUT",
  "AZE",
  "BDI",
  "BEL",
  "BEN",
  "BES",
  "BFA",
  "BGD",
  "BGR",
  "BHR",
  "BHS",
  "BIH",
  "BLM",
  "BLR",
  "BLZ",
  "BMU",
  "BOL",
  "BRA",
  "BRB",
  "BRN",
  "BTN",
  "BVT",
  "BWA",
  "CAF",
  "CAN",
  "CCK",
  "CHE",
  "CHL",
  "CHN",
  "CIV",
  "CMR",
  "COD",
  "COG",
  "COK",
  "COL",
  "COM",
  "CPV",
  "CRI",
  "CUB",
  "CUW",
  "CXR",
  "CYM",
  "CYP",
  "CZE",
  "D",
  "DJI",
  "DMA",
  "DNK",
  "DOM",
  "DZA",
  "ECU",
  "EGY",
  "ERI",
  "ESH",
  "ESP",
  "EST",
  "ETH",
  "FIN",
  "FJI",
  "FLK",
  "FRA",
  "FRO",
  "FSM",
  "GAB",
  "GBR",
  "GEO",
  "GGY",
  "GHA",
  "GIB",
  "GIN",
  "GLP",
  "GMB",
  "GNB",
  "GNQ",
  "GRC",
  "GRD",
  "GRL",
  "GTM",
  "GUF",
  "GUM",
  "GUY",
  "HKG",
  "HMD",
  "HND",
  "HRV",
  "HTI",
  "HUN",
  "IDN",
  "IMN",
  "IND",
  "IOT",
  "IRL",
  "IRN",
  "IRQ",
  "ISL",
  "ISR",
  "ITA",
  "JAM",
  "JEY",
  "JOR",
  "JPN",
  "KAZ",
  "KEN",
  "KGZ",
  "KHM",
  "KIR",
  "KNA",
  "KOR",
  "KWT",
  "LAO",
  "LBN",
  "LBR",
  "LBY",
  "LCA",
  "LIE",
  "LKA",
  "LSO",
  "LTU",
  "LUX",
  "LVA",
  "MAC",
  "MAF",
  "MAR",
  "MCO",
  "MDA",
  "MDG",
  "MDV",
  "MEX",
  "MHL",
  "MKD",
  "MLI",
  "MLT",
  "MMR",
  "MNE",
  "MNG",
  "MNP",
  "MOZ",
  "MRT",
  "MSR",
  "MTQ",
  "MUS",
  "MWI",
  "MYS",
  "MYT",
  "NAM",
  "NCL",
  "NER",
  "NFK",
  "NGA",
  "NIC",
  "NIU",
  "NLD",
  "NOR",
  "NPL",
  "NRU",
  "NZL",
  "OMN",
  "PAK",
  "PAN",
  "PCN",
  "PER",
  "PHL",
  "PLW",
  "PNG",
  "POL",
  "PRI",
  "PRK",
  "PRT",
  "PRY",
  "PSE",
  "PYF",
  "QAT",
  "REU",
  "ROU",
  "RUS",
  "RWA",
  "SAU",
  "SDN",
  "SEN",
  "SGP",
  "SGS",
  "SHN",
  "SJM",
  "SLB",
  "SLE",
  "SLV",
  "SMR",
  "SOM",
  "SPM",
  "SRB",
  "SSD",
  "STP",
  "SUR",
  "SVK",
  "SVN",
  "SWE",
  "SWZ",
  "SXM",
  "SYC",
  "SYR",
  "TCA",
  "TCD",
  "TGO",
  "THA",
  "TJK",
  "TKL",
  "TKM",
  "TLS",
  "TON",
  "TTO",
  "TUN",
  "TUR",
  "TUV",
  "TWN",
  "TZA",
  "UGA",
  "UKR",
  "UMI",
  "URY",
  "USA",
  "UTO",
  "UZB",
  "VAT",
  "VCT",
  "VEN",
  "VGB",
  "VIR",
  "VNM",
  "VUT",
  "WLF",
  "WSM",
  "YEM",
  "ZAF",
  "ZMB",
  "ZWE"
]

},{}],10:[function(require,module,exports){
const stringDateToYYMMDD = strDate =>
  new Date(strDate)
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, '')

module.exports = { stringDateToYYMMDD }

},{}],11:[function(require,module,exports){
const generateEmptyLine = nbChar => '<'.repeat(nbChar)

const _checkReplaceSubStringInput = (str, subStr, position) => {
  if (position + subStr.length > str.length) {
    throw new Error('replaceSubStringAtPosition : invalid input')
  }
}

const replaceSubStringAtPositionToUpCase = (str, subStr, position) => {
  _checkReplaceSubStringInput(str, subStr, position)
  return (
    str.substring(0, position) +
    subStr.toUpperCase() +
    str.substring(position + subStr.length, str.length)
  )
}

const replaceSpecialCharsBySpaces = str => str.replace(/[ |-|-|']/g, '<')

const truncateString = (str, maxLength) => str.substring(0, maxLength)

module.exports = {
  generateEmptyLine,
  replaceSubStringAtPositionToUpCase,
  replaceSpecialCharsBySpaces,
  truncateString
}

},{}]},{},[1]);
