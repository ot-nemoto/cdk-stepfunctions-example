exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  const date_ranges = [];

  const dt = new Date();
  console.log(dt);

  [...Array(3)].map(() => {
    let range = { sdate: null, edate: null };
    dt.setMonth(dt.getMonth() + 1, 1);
    range.sdate = dt.toISOString().substring(1, 10);
    dt.setMonth(dt.getMonth() + 1, 0);
    range.edate = dt.toISOString().substring(1, 10);
    date_ranges.push(range);
  });

  return {
    date_ranges: date_ranges,
  };
};
