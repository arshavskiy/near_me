window.mobilecheck = () => {
  if (navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  } else {
    return false;
  }
}

window.inview = () => {
  let all = document.querySelectorAll('.class');
  let array = [];
  let max;

  all.forEach(node => {

    const {
      top,
      right,
      bottom,
      left,
      width
    } = node.getBoundingClientRect();
    const intersection = {
      t: bottom,
      r: window.innerWidth - left,
      b: window.innerHeight - top,
      l: right
    };

    let inview = left >= (0 - width / 10) && right < (window.innerWidth + width / 10);
  });
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const preloadImages = (array, waitForOtherResources, timeout)=>{
  var loaded = false, list = preloadImages.list, imgs = array.slice(0), t = timeout || 15*1000, timer;
  if (!preloadImages.list) {
      preloadImages.list = [];
  }
  if (!waitForOtherResources || document.readyState === 'complete') {
      loadNow();
  } else {
      window.addEventListener("load", function() {
          clearTimeout(timer);
          loadNow();
      });
      // in case window.addEventListener doesn't get called (sometimes some resource gets stuck)
      // then preload the images anyway after some timeout time
      timer = setTimeout(loadNow, t);
  }

  function loadNow() {
    let that = this;
      if (!loaded) {
          loaded = true;
          for (let i = 0; i < imgs.length; i++) {
              let img = new Image();
              img.onload = img.onerror = img.onabort = function() {
                  let index = list.indexOf(that);
                  if (index !== -1) {
                      // remove image from the array once it's loaded
                      // for memory consumption reasons
                      list.splice(index, 1);
                  }
              }
              list.push(img);
              img.src = imgs[i];
          }
      }
  }
}