// source code from another project:
// https://github.com/meandavejustice/min-vid
// https://github.com/meandavejustice/min-vid/blob/master/data/icon-overlay.js - commit[0b94ede]

const host = window.location.host;
const overlayCheckInterval = setInterval(checkForEmbeds, 3000);
const positionList = ['topCenter', 'topLeft', 'topRight'];
let overlayIconPosition = 2;

const hideOverlayIcons = () => {
  Array.from(document.querySelectorAll('.popupvideo__overlay__container')).forEach(el => {
    el.classList.add('popupvideo__overlay__container__hide');
  });
};

const showOverlayIcons = ()  => {
  Array.from(document.querySelectorAll('.popupvideo__overlay__container')).forEach(el => {
    el.classList.remove('popupvideo__overlay__container__hide');
  });
};

document.addEventListener('fullscreenchange', function(event) {
  if(document.fullscreen) {
    hideOverlayIcons();
  }
  else {
    showOverlayIcons();
  }
}, false);

self.port.on('detach', function() {
  clearInterval(overlayCheckInterval);
  Array.from(document.querySelectorAll('.popupvideo__overlay__wrapper')).forEach(removeOverlay);
});

self.port.on('setIconPosition', function (data) {
  overlayIconPosition = data;
  Array.from(document.querySelectorAll('.popupvideo__overlay__container')).forEach(setOverlayPosition);
});

function setOverlayPosition(el) {
  el.classList.remove(...positionList);
  el.classList.add(positionList[overlayIconPosition]);
}

function removeOverlay(el) {
  el.classList.remove('popupvideo__overlay__wrapper');
  const containerEl = el.querySelector('.popupvideo__overlay__container');
  if (containerEl) containerEl.remove();
}

function checkForEmbeds() {
  ytEmbedChecks();
  vimeoEmbedChecks();
  twitchEmbedChecks();
  dmEmbedChecks();
}

function dmEmbedChecks() {
  // dailymotion Home Page
  const dmHomeContainers = Array.from(document.querySelectorAll('.sd_video_preview'));
  if (dmHomeContainers.length) {
    dmHomeContainers.forEach(dmHomePageHandler);
  }

  // dailymotion Watch Page
  const dmWatchContainer = document.querySelector('.dmp_VideoView');
  if (dmWatchContainer) {
    dmWatchElementHandler(dmWatchContainer);
  }

}

function dmHomePageHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;
  const url = el.getAttribute('data-id');

  el.classList.add('popupvideo__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    self.port.emit('launch', {
      url: 'https://www.dailymotion.com/video/' + url,
      domain: 'dailymotion.com'
    });
  });
  el.appendChild(tmp);
}

function dmWatchElementHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    const videoEl = document.querySelector('video');
    //videoEl.pause();
    closeFullscreen();
    self.port.emit('launch', {
      url: window.location.href,
      domain: 'dailymotion.com',
      time: videoEl.currentTime,
      volume: videoEl.volume,
      muted: videoEl.muted
    });
  }, true);
  el.appendChild(tmp);
}

function ytEmbedChecks() {
  if (!(host.indexOf('youtube.com') > -1)) return;

  // // YouTube Home Page
  // const ytHomeContainers = Array.from(document.querySelectorAll('#feed .yt-lockup-thumbnail'));
  // if (ytHomeContainers.length) {
  //   ytHomeContainers.forEach(ytHomePageHandler);
  // }

  // const ytSearchContainers = Array.from(document.querySelectorAll('#results .yt-lockup-thumbnail'));
  // if (ytSearchContainers.length) {
  //   ytSearchContainers.forEach(ytHomePageHandler);
  // }

  // video
  let ytHomeContainers = Array.from(document.querySelectorAll('ytd-thumbnail'));
  if (ytHomeContainers.length) {
    ytHomeContainers.forEach(ytHomePageHandler);
  }

  // YouTube Playlist
  let ytPlaylistContainers = Array.from(document.querySelectorAll('ytd-playlist-thumbnail'));
  if (ytPlaylistContainers.length) {
    ytPlaylistContainers.forEach(ytPlaylistHandler);
  }

  // YouTube Watch Page
  const ytWatchContainer = document.querySelector('.html5-video-player');
  if (ytWatchContainer) {
    ytWatchElementHandler(ytWatchContainer);
  }

  // YouTube Watch Page related videos
  const ytRelatedContainers = Array.from(document.querySelectorAll('.watch-sidebar-section .thumb-wrapper'));
  if (ytRelatedContainers.length) {
    ytRelatedContainers.forEach(ytHomePageHandler);
  }

  // YouTube Channel Page videos featured section
  const ytChannelFeaturedContainers = Array.from(document.querySelectorAll('#browse-items-primary .lohp-thumb-wrap'));
  if (ytChannelFeaturedContainers.length) {
    ytChannelFeaturedContainers.forEach(ytHomePageHandler);
  }

  // YouTube Channel Page videos uploads section
  const ytChannelUploadsContainers = Array.from(document.querySelectorAll('#browse-items-primary .yt-lockup-thumbnail'));
  if (ytChannelUploadsContainers.length) {
    ytChannelUploadsContainers.forEach(ytHomePageHandler);
  }
}

function ytHomePageHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  let urlEl = el.querySelector('a.ytd-thumbnail');

  if (!urlEl || !urlEl.getAttribute('href')) return;

  const url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    let urlEl2 = el.querySelector('a.ytd-thumbnail');
    let url2 = urlEl2.getAttribute('href');
    self.port.emit('launch', {
      url: 'https://youtube.com' + url2,
      domain: 'youtube.com'
    });
  });
  el.appendChild(tmp);
}

function ytPlaylistHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  let urlEl = el.querySelector('a.ytd-playlist-thumbnail');
  if (!urlEl || !urlEl.getAttribute('href')) return;

  let url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    self.port.emit('launch', {
      url: 'https://youtube.com' + url,
      domain: 'youtube.com'
    });
  });
  el.appendChild(tmp);
}

function ytWatchElementHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    const videoEl = document.querySelector('video');
    videoEl.pause();
    closeFullscreen();
    self.port.emit('launch', {
      url: window.location.href,
      domain: 'youtube.com',
      time: videoEl.currentTime,
      volume: videoEl.volume,
      muted: videoEl.muted
    });
  });
  el.appendChild(tmp);
}

function vimeoEmbedChecks() {
  if (!(host.indexOf('vimeo.com') > -1)) return;

  // VIMEO LOGGED-OUT HOME PAGE
  const vimeoDefaultHomeContainers = Array.from(document.querySelectorAll('.iris_video-vital__overlay'));
  if (vimeoDefaultHomeContainers.length) {
    vimeoDefaultHomeContainers.forEach(el => {
      if (el.classList.contains('popupvideo__overlay__wrapper')) return;

      el.classList.add('popupvideo__overlay__wrapper');
      const tmp = getTemplate();
      tmp.addEventListener('click', function(ev) {
        evNoop(ev);
        self.port.emit('launch', {
          url: 'https://vimeo.com' + el.getAttribute('href'),
          domain: 'vimeo.com'
        });
      });
      el.appendChild(tmp);
    });
  }

  // VIMEO LOGGED-IN HOME PAGE
  const vimeoHomeContainers = Array.from(document.querySelectorAll('.player_wrapper'));
  if (vimeoHomeContainers.length) {
    vimeoHomeContainers.forEach(el => {
      if (el.classList.contains('popupvideo__overlay__wrapper')) return;

      el.classList.add('popupvideo__overlay__wrapper');
      const tmp = getTemplate();
      tmp.addEventListener('click', function(ev) {
        evNoop(ev);
        const fauxEl = el.querySelector('.faux_player');
        if (fauxEl) {
          self.port.emit('launch', {
            url: 'https://vimeo.com/' + fauxEl.getAttribute('data-clip-id'),
            domain: 'vimeo.com'
          });
        } else console.error('Error: failed to locate vimeo url'); // eslint-disable-line no-console
      });
      el.appendChild(tmp);
    });
  }

  // VIMEO DETAIL PAGE
  const vimeoDetailContainer = document.querySelector('.player_container');
  if (vimeoDetailContainer) {
    if (vimeoDetailContainer.classList.contains('popupvideo__overlay__wrapper')) return;
    vimeoDetailContainer.classList.add('popupvideo__overlay__wrapper');
    const videoEl = vimeoDetailContainer.querySelector('video');
    const tmp = getTemplate();
    tmp.addEventListener('mouseup', evNoop);
    tmp.addEventListener('click', function(ev) {
      evNoop(ev);
      videoEl.pause();
      self.port.emit('launch', {
        url: window.location.href,
        domain: 'vimeo.com',
        volume: videoEl.volume,
        muted: videoEl.muted
      });
    }, true);
    vimeoDetailContainer.appendChild(tmp);
  }
}

function twitchEmbedChecks() {
  if (!(host.indexOf('twitch.tv') > -1)) return;

  let twitchStreamItems = Array.from(document.querySelectorAll('.live-channel-card')); //TODO: Need fix
  if (twitchStreamItems.length) {
    twitchStreamItems.forEach(twitchStreamHandler);
  }

  // twitch video list Page
  let twitchVodItems = Array.from(document.querySelectorAll('div[data-a-target^="video-tower-card-"]'));
  if (twitchVodItems.length) {
    twitchVodItems.forEach(twitchVodHandler);
  }

  // twitch Watch Page
  let twitchWatchContainer = document.querySelector('.player');
  if (twitchWatchContainer) {
    twitchWatchHandler(twitchWatchContainer);
  }
}

function twitchStreamHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    let urlEl = el.querySelector('a[data-a-target="preview-card-image-link"]');
    if (urlEl && urlEl.getAttribute('href')) {
      self.port.emit('launch', {
        url: urlEl.href,
        domain: 'twitch.tv'
      });
    } else console.error('Error parsing url from Twitch stream list page', el); // eslint-disable-line no-console
  });
  el.appendChild(tmp);
}

function twitchVodHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let thumbnail = el.querySelector('.tw-full-width');

  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let urlEl = el.querySelector('a[data-a-target="video-preview-card-image-link"]');
    //let urlEl = el.parentNode;
    if (urlEl && urlEl.getAttribute('href')) {
      self.port.emit('launch', {
        url: urlEl.href,
        domain: 'twitch.tv'
      });
    } else console.error('Error parsing url from Twitch stream list page', el); // eslint-disable-line no-console
  },true);
  thumbnail.appendChild(tmp);
}

function twitchWatchHandler(el) {
  if (el.classList.contains('popupvideo__overlay__wrapper')) return;

  el.classList.add('popupvideo__overlay__wrapper');
  let tmp = getTemplate();
  tmp.addEventListener('click', ev => {
    evNoop(ev);
    let videoEl = document.querySelector('video');
    videoEl.pause();
    closeFullscreen();
    self.port.emit('launch', {
      url: window.location.href,
      domain: 'twitch.tv',
      time: videoEl.currentTime
    });
  },true);
  el.appendChild(tmp);
}

// General Helpers
function getTemplate() {
  const containerEl = document.createElement('div');
  const iconEl = document.createElement('div');

  containerEl.className = 'popupvideo__overlay__container';
  containerEl.classList.add(positionList[overlayIconPosition]);
  iconEl.className = 'popupvideo__overlay__icon';

  containerEl.appendChild(iconEl);
  return containerEl;
}

function evNoop(ev) {
  ev.preventDefault();
  ev.stopImmediatePropagation();
}

function closeFullscreen() {
  if (document.mozFullScreenEnabled) {
    document.mozCancelFullScreen();
  }
}
