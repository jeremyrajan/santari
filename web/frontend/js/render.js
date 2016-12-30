const deleteJob = (e) => {
  console.log(e.target);
};

$(document).ready(() => {
  const elJobs = $('#jobs');
  $('.menu-list').click((e) => {
    $('#content').find('div').css('display', 'none');
    const div = $(e.target).attr('data-href').replace('#', '');
    // $(`#${div}`).css('display', 'block');
    $(`#${div}`).fadeIn();
  });

  // jobs
  $.get('http://localhost:8080/jobs', {}, (data, status) => {
    if (!status === 'success') {
      return false;
    }
    const jobs = data.split(',');
    let jobsHtml = `<table class="table">
        <thead>
          <tr>
            <td>Repository</td>
            <td>Schedule</td>
            <td>Options</td>
          </tr>
        </thead>`;
    jobsHtml += jobs.map((j) => {
      return `<tr>
                <td>${j}</td>
                <td>${j}</td>
                <td class="is-icon">
                  <a href="#" onclick="deleteJob(event)"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
                </td>
              </tr>`;
    }).join('');
    jobsHtml += '</table>';
    elJobs.append(jobsHtml);
  });

  // $.get('http://localhost:8080/job/create', {
  //   cmd: 'ls -l',
  //   interval: '@daily'
  // }, (data, status) => {
  //   console.log(status);
  //   console.log(data);
  // });
});
