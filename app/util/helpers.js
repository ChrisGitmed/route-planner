import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatInTimeZone } from 'date-fns-tz';
import { Readable } from 'stream';

import { config } from '../../config/index.js';


class Helpers {
  // GET COOKIE OPTIONS
  static getCookieOptions (originDomain, clearMaxAge) {
    const options = {
      httpOnly: true,
      secure: config.NODE_ENV !== 'localdev',
      domain: originDomain,
    };
    if (!clearMaxAge) options.maxAge = 10000000000000;
    return options;
  }


  // GET IS INTERSECTING
  static getIsIntersecting (arrayOne = [], arrayTwo = []) {
    // Returns true if the two arrays have any elements in common
    // Can be used to determine things like: 'Does the User have
    // any of the required permissions?', or 'Does the User have
    // any of the required feature flags?'
    // Defaults to true if array one is empty
    return arrayOne.length
      ? arrayOne.some((element) => arrayTwo.includes(element))
      : true;
  }


  // IS MAIN
  static isMain = (moduleUrl) => {
    // Determines if a file is being invoked from the command line or not
    const modulePath = path.resolve(fileURLToPath(moduleUrl));
    const mainScriptPath = path.resolve(process.argv[1]);
    return modulePath === mainScriptPath;
  };


  // IS NUMERIC
  static isNumeric = (value) => {
    if (typeof value !== 'string') return false;
    return !isNaN(value) && !isNaN(parseFloat(value)); // Ensures strings of whitespace fail
  };


  // IS VALID TIME STRING
  static isValidTimeString = (value) => {
    // If the provided value is not a string, return false
    if (typeof value !== 'string') return false;

    // If the string is not two values separated by one whitespace character, return false
    const firstSplit = value.split(' ');
    if (firstSplit.length !== 2) return false;

    // Parse the first and second values
    const [firstValue, secondValue] = firstSplit;

    // If the first value is not one or two integers, then a colon, then two more integers, return false;
    const timeSegments = firstValue.split(':');
    if (timeSegments.length !== 2) return false;
    const [hour, minutes] = timeSegments;
    if (hour.length > 2) return false;
    if (minutes.length > 2) return false;
    if (!Helpers.isNumeric(hour)) return false;
    if (!Helpers.isNumeric(minutes)) return false;

    // If the second value is not 'AM' or 'PM', return false
    if (!['AM', 'PM'].includes(secondValue)) return false;

    // If we made it this far then the string is a valid time
    return true;
  };


  // PASSWORD VALIDATION
  static passwordValidation (password, options, length) {
    const isValid = [];
    const checkConsecutive = (chars) => {
      for (let i = 0; i < chars.length - 1; i++) {
        if (chars[i] === chars[i + 1]) return true;
      }
      return false;
    };

    const _alpha = /[A-Za-z]/.test(password);
    const _numeric = /[0-9]/.test(password);
    const _caps = /[A-Z]/.test(password);
    const _symbols = /[!@#$&()\-`.+,/"]/.test(password);
    const _consecutive = !checkConsecutive(password);
    const _length = password.length;

    if (options.alpha) isValid.push(_alpha);
    if (options.numeric) isValid.push(_numeric);
    if (options.caps) isValid.push(_caps);
    if (options.symbols) isValid.push(_symbols);
    if (options.consecutive) isValid.push(_consecutive);
    if (length) isValid.push(_length >= length);

    for (let i = 0; i < isValid.length; i++) {
      if (!isValid[i]) return false;
    }

    return true;
  }


  // GENERATE MFA CODE
  static generateRandomString ({ length = 8, type = 'mixed' }) {
    const alphaNumeric = [];
    let starterString = '';
    if (type === 'mixed') starterString = Constants.ALPHA_NUMERIC_MIXED;
    if (type === 'upper') starterString = Constants.ALPHA_NUMERIC_UPPER;
    if (type === 'lower') starterString = Constants.ALPHA_NUMERIC_LOWER;
    if (type === 'number') starterString = Constants.NUMERIC_ONLY;

    // pick random chars from the alpha numeric list
    for (let i = 0; i < length; i++) {
      // pick a random alpha numeric char and accumulate into an array
      const choice = starterString[Math.floor((Helpers.secure_rng()) * starterString.length)];
      alphaNumeric.push(choice);
    }

    // put the two parts together
    let shuffledCode = [...alphaNumeric];

    // shuffle it a random num of times below 100
    const numShuffles = Helpers.csprngIntBelow(100);
    for (let i = 0; i < numShuffles; i++) {
      shuffledCode = Helpers.shuffle_array(shuffledCode);
    }

    // concat the list into a string
    return shuffledCode.join('');
  }


  // CSPRNG INT BELOW
  static csprngIntBelow (num) {
    return Math.floor((Helpers.secure_rng()) * num);
  }


  // SECURE RNG
  static secure_rng () {
    return crypto.randomBytes(4).readUInt32LE() / 0x100000000;
  }


  // SHUFFLE ARRAY
  static shuffle_array (array) {
    return array
      .map((value) => ({ value, sort: Helpers.secure_rng() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
}


export { Helpers };
