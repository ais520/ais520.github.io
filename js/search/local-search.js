window.addEventListener('load', () => {
  let loadFlag = false
  const openSearch = () => {
    const bodyStyle = document.body.style
    bodyStyle.width = '100%'
    bodyStyle.overflow = 'hidden'
    btf.animateIn(document.getElementById('search-mask'), 'to_show 0.5s')
    btf.animateIn(document.querySelector('#local-search .search-dialog'), 'titleScale 0.5s')
    setTimeout(() => { document.querySelector('#local-search-input input').focus() }, 100)
    if (!loadFlag) {
      search(GLOBAL_CONFIG.localSearch.path)
      loadFlag = true
    }
    // shortcut: ESC
    document.addEventListener('keydown', function f (event) {
      if (event.code === 'Escape') {
        closeSearch()
        document.removeEventListener('keydown', f)
      }
    })
  }

  const closeSearch = () => {
    const bodyStyle = document.body.style
    bodyStyle.width = ''
    bodyStyle.overflow = ''
    btf.animateOut(document.querySelector('#local-search .search-dialog'), 'search_close .5s')
    btf.animateOut(document.getElementById('search-mask'), 'to_hide 0.5s')
  }

  // click function
  const searchClickFn = () => {
    document.querySelector('#search-button > .search').addEventListener('click', openSearch)
    document.getElementById('search-mask').addEventListener('click', closeSearch)
    document.querySelector('#local-search .search-close-button').addEventListener('click', closeSearch)
  }

  searchClickFn()

  // pjax
  window.addEventListener('pjax:complete', function () {
    getComputedStyle(document.querySelector('#local-search .search-dialog')).display === 'block' && closeSearch()
    searchClickFn()
  })

  async function search (path) {
    let datas = []
    const typeF = path.split('.')[1]
    const response = await fetch(GLOBAL_CONFIG.root + path)
    if (typeF === 'json') {
      datas = await response.json()
    } else if (typeF === 'xml') {
      const res = await response.text()
      const t = await new window.DOMParser().parseFromString(res, 'text/xml')
      const a = await t
      datas = [...a.querySelectorAll('entry')].map(function (item) {
        return {
          title: item.querySelector('title').textContent,
          content: item.querySelector('content').textContent,
          url: item.querySelector('url').textContent
        }
      })
    }
    if (response.ok) {
      const $loadDataItem = document.getElementById('loading-database')
      $loadDataItem.nextElementSibling.style.display = 'block'
      $loadDataItem.remove()
    }

    const $input = document.querySelector('#local-search-input input')
    const $resultContent = document.getElementById('local-search-results')
    const $loadingStatus = document.getElementById('loading-status')
    $input.addEventListener('input', function () {
      const keywords = this.value.trim().toLowerCase().split(/[\s]+/)
      if (keywords[0] !== '') $loadingStatus.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>'

      $resultContent.innerHTML = ''
      let str = '<div class="search-result-list">'
      if (this.value.trim().length <= 0) return
      let count = 0
      // perform local searching
      datas.forEach(function (data) {
        let isMatch = true
        if (!data.title || data.title.trim() === '') {
          data.title = ''
        }
        let dataTitle = data.title.trim().toLowerCase()
        const dataContent = data.content ? data.content.trim().replace(/<[^>]+>/g, '').toLowerCase() : ''
        const dataUrl = data.url.startsWith('/') ? data.url : GLOBAL_CONFIG.root + data.url
        let indexTitle = -1
        let indexContent = -1
        let firstOccur = -1
        // only match artiles with not empty titles and contents
        if (dataTitle !== '' || dataContent !== '') {
          keywords.forEach(function (keyword, i) {
            indexTitle = dataTitle.indexOf(keyword)
            indexContent = dataContent.indexOf(keyword)
            if (indexTitle < 0 && indexContent < 0) {
              isMatch = false
            } else {
              if (indexContent < 0) {
                indexContent = 0
              }
              if (i === 0) {
                firstOccur = indexContent
              }
            }
          })
        } else {
          isMatch = false
        }

        // show search results
        if (isMatch) {
          const content = data.content.trim().replace(/<[^>]+>/g, '')
          if (firstOccur >= 0) {
            // cut out 130 characters
            // let start = firstOccur - 30 < 0 ? 0 : firstOccur - 30
            // let end = firstOccur + 50 > content.length ? content.length : firstOccur + 50
            let start = firstOccur - 30
            let end = firstOccur + 100

            if (start < 0) {
              start = 0
            }

            if (start === 0) {
              end = 100
            }

            if (end > content.length) {
              end = content.length
            }

            let matchContent = content.substring(start, end)

            // highlight all keywords
            keywords.forEach(function (keyword) {
              const regS = new RegExp(keyword, 'gi')
              matchContent = matchContent.replace(regS, '<span class="search-keyword">' + keyword + '</span>')
              dataTitle = dataTitle.replace(regS, '<span class="search-keyword">' + keyword + '</span>')
            })

            str += '<div class="local-search__hit-item"><a href="' + dataUrl + '" class="search-result-title">' + dataTitle + '</a>'
            count += 1

            if (dataContent !== '') {
              str += '<p class="search-result">' + matchContent + '...</p>'
            }
          }
          str += '</div>'
        }
      })
      if (count === 0) {
        str += '<div id="local-search__hits-empty">' + GLOBAL_CONFIG.localSearch.languages.hits_empty.replace(/\$\{query}/, this.value.trim()) +
          '</div>'
      }
      str += '</div>'
      $resultContent.innerHTML = str
      if (keywords[0] !== '') $loadingStatus.innerHTML = ''
      window.pjax && window.pjax.refresh($resultContent)
    })
  }
})

function dark() {window.requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;var n,e,i,h,t=.05,s=document.getElementById("universe"),o=!0,a="180,184,240",r="226,225,142",d="226,225,224",c=[];function f(){n=window.innerWidth,e=window.innerHeight,i=.216*n,s.setAttribute("width",n),s.setAttribute("height",e)}function u(){h.clearRect(0,0,n,e);for(var t=c.length,i=0;i<t;i++){var s=c[i];s.move(),s.fadeIn(),s.fadeOut(),s.draw()}}function y(){this.reset=function(){this.giant=m(3),this.comet=!this.giant&&!o&&m(10),this.x=l(0,n-10),this.y=l(0,e),this.r=l(1.1,2.6),this.dx=l(t,6*t)+(this.comet+1-1)*t*l(50,120)+2*t,this.dy=-l(t,6*t)-(this.comet+1-1)*t*l(50,120),this.fadingOut=null,this.fadingIn=!0,this.opacity=0,this.opacityTresh=l(.2,1-.4*(this.comet+1-1)),this.do=l(5e-4,.002)+.001*(this.comet+1-1)},this.fadeIn=function(){this.fadingIn&&(this.fadingIn=!(this.opacity>this.opacityTresh),this.opacity+=this.do)},this.fadeOut=function(){this.fadingOut&&(this.fadingOut=!(this.opacity<0),this.opacity-=this.do/2,(this.x>n||this.y<0)&&(this.fadingOut=!1,this.reset()))},this.draw=function(){if(h.beginPath(),this.giant)h.fillStyle="rgba("+a+","+this.opacity+")",h.arc(this.x,this.y,2,0,2*Math.PI,!1);else if(this.comet){h.fillStyle="rgba("+d+","+this.opacity+")",h.arc(this.x,this.y,1.5,0,2*Math.PI,!1);for(var t=0;t<30;t++)h.fillStyle="rgba("+d+","+(this.opacity-this.opacity/20*t)+")",h.rect(this.x-this.dx/4*t,this.y-this.dy/4*t-2,2,2),h.fill()}else h.fillStyle="rgba("+r+","+this.opacity+")",h.rect(this.x,this.y,this.r,this.r);h.closePath(),h.fill()},this.move=function(){this.x+=this.dx,this.y+=this.dy,!1===this.fadingOut&&this.reset(),(this.x>n-n/4||this.y<0)&&(this.fadingOut=!0)},setTimeout(function(){o=!1},50)}function m(t){return Math.floor(1e3*Math.random())+1<10*t}function l(t,i){return Math.random()*(i-t)+t}f(),window.addEventListener("resize",f,!1),function(){h=s.getContext("2d");for(var t=0;t<i;t++)c[t]=new y,c[t].reset();u()}(),function t(){document.getElementsByTagName('html')[0].getAttribute('data-theme')=='dark'&&u(),window.requestAnimationFrame(t)}()};
dark()

