import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import formo from 'formo';
import printJSON from 'printJSON';
import { Button, Dropdown, Toggle } from 'buildo-react-components';
import { DatePickerInput } from 'rc-datepicker';

import 'buildo-react-components/src/button/button.scss';
import 'buildo-react-components/src/dropdown/dropdown.scss';
import 'rc-datepicker/lib/style.css';
import 'buildo-react-components/src/toggle/toggle.scss';

const formoConfig = () => ({
  favouriteCountries: {},
  preferredConditions: {},
  bestDayOfYourLife: {},
  doYouLikeTrains: {
    initialValue: true
  }
});


@formo(formoConfig)
@pure
@skinnable()
@props({
  form: t.Object,
  favouriteCountries: t.Object, // specify
  preferredConditions: t.Object, //specify
  bestDayOfYourLife: t.Object,
  doYouLikeTrains: t.Object
})
export default class LastOneIPromise extends React.Component {

  template({ favouriteCountries, bestDayOfYourLife, preferredConditions, doYouLikeTrains, form }) {

    return (
      <View basis='50%'>
        <View column width={600}>

          <View>
            Select the best day of your life
            <DatePickerInput value={bestDayOfYourLife.value} onChange={bestDayOfYourLife.update} />
          </View>

          <View>
            Select your favourite countries
            <Dropdown
              multi
              clearable
              value={favouriteCountries.value}
              onChange={favouriteCountries.update}
              options={'germany italy france uk usa spain portugal australia denmark japan'.split(' ').map(c => ({ label: c, value: c }))}
            />
          </View>

          <View>
            What's your favourite condition
            <Dropdown
              clearable
              options={'near to the beach, near to the mountain, close to the city, away from the smog'.split(', ').map(x => ({ label: x, value: x }))}
              value={preferredConditions.value}
              onChange={preferredConditions.update}
            />
          </View>

          <View>
            Do you like trains?
            <Toggle value={doYouLikeTrains.value} onChange={doYouLikeTrains.update} />
          </View>

          <Button onClick={form.clearValues} label='clear'/>

        </View>


        <View column  marginTop={30}>
          <textarea
            readOnly
            style={{ height: 500, width: 500, fontFamily: 'monospace' }}
            value={printJSON({ favouriteCountries, bestDayOfYourLife, preferredConditions, doYouLikeTrains })}
          />
        </View>
      </View>
    );
  }

}
