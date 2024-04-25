exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  const date_ranges = [];
  const run_tasks = [];

  const dt = new Date();
  console.log(dt);

  [...Array(3)].map(() => {
    let cmd = [];
    cmd.push('echo');

    let range = { sdate: null, edate: null };
    dt.setMonth(dt.getMonth() + 1, 1);
    cmd.push('--start_date');
    cmd.push(dt.toISOString().substring(1, 10));
    range.sdate = dt.toISOString().substring(1, 10);

    dt.setMonth(dt.getMonth() + 1, 0);
    cmd.push('--end_date');
    cmd.push(dt.toISOString().substring(1, 10));
    range.edate = dt.toISOString().substring(1, 10);

    date_ranges.push(range);

    run_tasks.push({ input: { commands: cmd } });
  });

  return {
    date_ranges: date_ranges,
    run_tasks: run_tasks,
  };
};
