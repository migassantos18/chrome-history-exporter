chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'exportHistory') {
    let exportFormat = message.format.toLowerCase();
    let dataContent;

    //Fetch and process history data
    if (exportFormat === 'csv') {
      fetchHistory(message.days)
        .then((historyData) => {
          dataContent = generateCSVContent(historyData);
          downloadFile(dataContent, `historico.csv`, 'text/csv;charset=UTF-16LE');
        })
        .catch((error) => {
          console.error("Error exporting history:", error);
        });
    } else if (exportFormat === 'json') {
      fetchHistory(message.days)
        .then((historyData) => {
          dataContent = JSON.stringify(historyData, null, 2);
          downloadFile(dataContent, `historico.json`, 'application/json');
        })
        .catch((error) => {
          console.error("Error exporting history:", error);
        });
    } else {
      console.error("Unsupported export format:", exportFormat);
    }
  }
});

//Generate CSV content
function generateCSVContent(historyData) {
  let csvContent = "\ufeff";
  csvContent += "URL;Título;Data;Número de visitas;Origem\r\n";
  historyData.forEach(item => {
    csvContent += `${item.url};${item.title};${new Date(item.lastVisitTime).toLocaleString()};${item.visitCount};${item.transitionType}\r\n`;
  });
  return csvContent;
}

//Fetch history entries within a specified time range
function fetchHistory(days) {
  const endTime = Date.now();
  const startTime = endTime - (days * 24 * 60 * 60 * 1000);

  return new Promise((resolve, reject) => {
    chrome.history.search({ text: "", startTime: startTime, endTime: endTime, maxResults: 2147483647 }, function(data) {
      const promises = [];
      const historyData = [];
      data.forEach(function(item) {
        const promise = new Promise((resolveVisit, rejectVisit) => {
          chrome.history.getVisits({url: item.url}, function(visits) {
            const transitionType = visits.length > 0 ? visits[0].transition : 'unknown';
            historyData.push({
              url: item.url,
              title: item.title,
              lastVisitTime: item.lastVisitTime,
              visitCount: item.visitCount,
              transitionType: transitionType
            });
            resolveVisit();
          });
        });
        promises.push(promise);
      });

      Promise.all(promises).then(() => {
        resolve(historyData);
      }).catch((error) => {
        reject(error);
      });
    });
  });
}

//Download file
function downloadFile(content, filename, mimeType) {
  let encodedContent = encodeURIComponent(content);
  let encodedUri = `data:${mimeType},${encodedContent}`;
  chrome.downloads.download({ url: encodedUri, filename: filename });
}