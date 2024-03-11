document.addEventListener('DOMContentLoaded', function() {
  var exportBtn = document.getElementById('exportBtn');

  exportBtn.addEventListener('click', function() {
    var time = document.querySelector('input[name="time"]:checked');
    var format = document.querySelector('input[name="format"]:checked');
    if (time != null && format != null) {
      chrome.runtime.sendMessage({action: 'exportHistory', days: parseInt(time.value), format: format.value});
    }
    else {
      console.error("Select time and/or format.");
    }
  });
});