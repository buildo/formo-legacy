import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import formo, { Input } from 'formo';
import range from 'lodash/range';
import compact from 'lodash/compact';
import map from 'lodash/map';
import printJSON from 'printJSON';
import { Button } from 'buildo-react-components';

import 'buildo-react-components/src/button/button.scss';

const inputStyle = {
  fontSize: 18,
  height: 30,
  marginBottom: 10,
  width: '100%'
};

const style = ({ isValid, active, touched }) => ({
  ...inputStyle,
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

const formoConfig = (props) => props.value || ({
  rating: {
    initialValue: 0,
    validations: value => ({
      required: value > 0 ? null : 'this value is required'
    })
  },
  feedback: {
    initialValue: ''
  },
  securityQuestion: {
    initialValue: '',
    validations: value => ({
      incorrect: parseInt(value) === (8 + 5) ? null : 'the answer is incorrect'
    })
  }
});

const startRatingStyle = {
  fontSize: 32,
  margin: '0 5px',
  cursor: 'pointer'
};

const StarRating = ({ rating, onChange }) => (
  <View>
    {range(5).map((star, i) => <View key={star} style={{ ...startRatingStyle, opacity: rating >= (i + 1) ? 1 : .5 }} onClick={() => { onChange(i + 1); }}>⭐</View>)}
  </View>
);

@formo(formoConfig)
@pure
@skinnable()
@props({
  form: t.Object,
  rating: t.Object, // specify
  feedback: t.Object, //specify
  securityQuestion: t.Object
})
export default class AnotherOneOfMyForms extends React.Component {

  template({ rating, feedback, securityQuestion, form }) {

    return (
      <View basis='50%'>
        <View column width={600}>

          <View>
            <StarRating rating={rating.value} onChange={rating.update} />
            {rating.touched && compact(map(rating.validations)).join(', ')}
          </View>

          <View>
            <textarea style={style(feedback)} value={feedback.value || ''} onChange={e => feedback.update(e.target.value)} />
            {feedback.touched && compact(map(feedback.validations)).join(', ')}
          </View>

          <View>
            <label>8 + 5 =</label>
            <Input style={{ ...inputStyle, ...style(securityQuestion) }} type='number' value={securityQuestion.value} onChange={securityQuestion.update} />
            {securityQuestion.touched && compact(map(securityQuestion.validations)).join(', ')}
          </View>

          <Button onClick={form.clearValues} label='clear'/>
          <Button onClick={form.touchAll} label='validate'/>

        </View>


        <View column  marginTop={30}>
          <textarea
            readOnly
            style={{ height: 500, width: 500, fontFamily: 'monospace' }}
            value={printJSON({ rating, feedback, securityQuestion })}
          />
        </View>
      </View>
    );
  }

}
