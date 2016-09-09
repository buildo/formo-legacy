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
  validating: false // I would like this to be the default
});

const formo = Formo({
  username: textField,
  password: textField
});

const update = Formo.update(formo);

const updateUserName = update('username');
const updatePassword = update('password');

debug(
  updateUserName('m'),
  updateUserName('ma'),
  updateUserName('mar'),
  updateUserName('mari'),
  updateUserName('mario'),
  updatePassword('S'),
  updatePassword('Si'),
  updatePassword('Sic'),
  updatePassword('Sicu'),
  updatePassword('Sicur'),
  updatePassword('Sicura'),
  updatePassword('Sicura1'),
  updatePassword('Sicura1!'),
);
