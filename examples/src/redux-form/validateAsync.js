const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const asyncValidate = (values/*, dispatch */) => {
  return sleep(1000) // simulate server latency
    .then(() => {
      console.log(values.email);
      if (![ 'andrea.ascari@buildo.io' ].includes(values.email)) {
        throw { email: 'That email doesn\'t exist.' };
      }
    });
};

export default asyncValidate;
