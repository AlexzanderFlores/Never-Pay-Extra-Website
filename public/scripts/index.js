$('footer #apps-container').css('display', 'none');
$(document).ready(() => {
  setTimeout(() => {
    if($('#wrapper').attr('extension-enabled') === 'false') {
      if(navigator.userAgent.indexOf('Chrome') >= 0) {
        $('#browser-plugin #chrome-app').css('animation', 'app-pulse-chrome 1s linear infinite');
      } else if(navigator.userAgent.indexOf('Firefox') >= 0) {
        $('#browser-plugin #fire-fox-app').css('animation', 'app-pulse-fire-fox 1s linear infinite');
      }
    }
  }, 1000);
});
