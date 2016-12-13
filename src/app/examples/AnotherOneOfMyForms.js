import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import formo from 'formo';
import range from 'lodash/range';
import printJSON from 'printJSON';

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

const formoConfig = () => ({
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

const inputStyle = {
  fontSize: 18,
  height: 30,
  marginBottom: 10,
  width: '100%'
};

const startRatingStyle = {
  fontSize: 32,
  margin: '0 5px',
  cursor: 'pointer'
};

const Input = ({ onChange, style = {}, ...others }) => <input onChange={e => onChange(e.target.value)} {...others} style={{ ...inputStyle, ...style }} />;

const StarRating = ({ rating, onChange }) => (
  <View>
    {range(5).map((star, i) => <View style={{ ...startRatingStyle, opacity: rating >= (i + 1) ? 1 : .5 }} onClick={() => { onChange(i + 1); }}>⭐</View>)}
  </View>
);

@formo(formoConfig)
@pure
@skinnable()
@props({
  rating: t.Object, // specify
  feedback: t.Object, //specify
  securityQuestion: t.Object
})
export default class AnotherOneOfMyForms extends React.Component {

  template({ rating, feedback, securityQuestion }) {

    return (
      <View basis='50%'>
        <View column width={600}>

          <View>
            <StarRating rating={rating.value} onChange={rating.update} />
          </View>

          <View>
            <textarea style={style(feedback)} value={feedback.value} onChange={e => feedback.update(e.target.value)} />
          </View>

          <View>
            <label>8 + 5 =</label>
            <Input style={style(securityQuestion)} type='number' value={securityQuestion.value} onChange={securityQuestion.update} />
          </View>

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
