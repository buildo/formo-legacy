import { Formo, Fieldo } from './definitions';
import { update, touch, setAsyncValidating, unsetAsyncValidating, activate, isValid, isChanged } from './methods';

Formo.update = update;
Formo.touch = touch;
Formo.setAsyncValidating = setAsyncValidating;
Formo.unsetAsyncValidating = unsetAsyncValidating;
Formo.activate = activate;

Fieldo.isValid = isValid;
Fieldo.isChanged = isChanged;

export { Fieldo, Formo };
export default Formo;
