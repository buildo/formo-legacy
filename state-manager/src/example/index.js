import t from 'tcomb';
import _debug from 'debug';

import Formo, { Fieldo } from '../';

const debug = _debug('formo-state-manager:example');

const textField = Fieldo({
  type: t.String,
  originalValue: '', // I would like this to be the default, for t.String
  value: '', // I would like this to be the default, for t.String
  touched: false, // I would like this to be the default
  active: false, // I would like this to be the default
  validating: false, // I would like this to be the default
  isValid: true
});

const formo = Formo({
  username: textField,
  password: textField
});

const update = Formo.update(formo);
const touch = Formo.touch(formo);
const activate = Formo.activate(formo);
const setAsyncValidating = Formo.setAsyncValidating(formo);

const updateUserName = update('username');
const updatePassword = update('password');

debug(updateUserName('mario').username.value === 'mario');
debug(updatePassword('Sicura1!').password.value === 'Sicura1!');
debug(touch('username').username.touched === true);
debug(activate('username').username.active === true);
debug(activate('username').password.active === false);
debug(setAsyncValidating('username').username.validating === true);
