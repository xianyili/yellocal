/** ==========anchor============== */
if ('onhashchange' in window && (typeof document.documentMode === 'undefined' || document.documentMode == 8)) {
    window.onhashchange = function () {
      anchorPoint();
      updateAnchor();
    };
  }
  function anchorPoint() {
    const hash = window.location.hash?.replace(/^#/, '') || '';
    const elm = document.getElementById(decodeURIComponent(hash));
    Array.from(document.querySelectorAll('.h2wrap-body .wrap')).forEach((elm) => elm.classList.remove('active'));
    if (elm?.tagName === 'H3') {
      elm?.parentElement?.parentElement?.classList.add('active');
    }
  }
  anchorPoint();
  function updateAnchor(element) {
    const anchorContainer = document.querySelectorAll('.menu-tocs .menu-modal a.tocs-link');
    anchorContainer.forEach((tocanchor) => {
      tocanchor.classList.remove('is-active-link');
    });
    const anchor = element || document.querySelector("a.tocs-link[href='${decodeURIComponent(window.location.hash)}']");
    if (anchor) {
      anchor.classList.add('is-active-link');
    }
  }
  // toc 定位
  updateAnchor();
  const anchorAll = document.querySelectorAll('.menu-tocs .menu-modal a.tocs-link');
  anchorAll.forEach((item) => {
    item.addEventListener('click', (e) => {
      updateAnchor();
    });
  });
  
  /** ==========search============== */
  const fuse = new Fuse(REFS_DATA, {
    includeScore: !1,
    shouldSort: !0,
    includeMatches: !0,
    matchEmptyQuery: !0,
    threshold: 0.1,
    keys: [
      { name: 'name', weight: 20 },
      { name: 'intro', weight: 2 },
      { name: 'tags', weight: 2 },
      { name: 'sections.t', weight: 5 },
    ],
  });
  
  const searchBtn = document.getElementById('searchbtn');
  const searchBox = document.getElementById('mysearch');
  const searchInput = document.getElementById('mysearch-input');
  const closeBtn = document.getElementById('mysearch-close');
  const searchMenu = document.getElementById('mysearch-menu');
  const searchContent = document.getElementById('mysearch-content');
  const isHome = document.body.classList.contains('home');
  
  const myfavoriteBtn = document.getElementById('myfavoritebtn');
  const favoritecloseBtn = document.getElementById('myfavorite-close');
  const favoriteBox = document.getElementById('myfavorite');
 
  const myprofileBtn = document.getElementById('myprofilebtn');
  const myprofileBox = document.getElementById('myprofile');
  const myprofilecloseBtn = document.getElementById('myprofile-close');
  const donelist = document.querySelector('#myfavorite-content');
  const donecount = document.querySelector('#myfavoritecount');
  const profileContent = document.getElementById('myprofile-content');
  const profileInfo = document.getElementById('myprofileinfo');
  const myagendaList = document.getElementById('myagenda'); 
  const inputodo = document.getElementById("gitodotext");
  const inputodoadd = document.getElementById("gitodobutton");
  const todonelist = document.querySelector("#gitodonelist");
  const todolist = document.querySelector("#gitodolist");
  const todonecount = document.querySelector("#gitodonecount");
  const todocount = document.querySelector("#gitodocount");
  const todocontent = document.querySelector('.gitodocon');

  function getDocUrl(url = '') {
    return isHome ? url : url.replace('guides/', '');
  }
  searchBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    showSearch();
  });
  
  closeBtn.addEventListener('click', hideSearch);
  searchBox.addEventListener('click', hideSearch);
  searchBox.firstChild.addEventListener('click', (ev) => ev.stopPropagation());
  searchInput.addEventListener('input', (evn) => searchResult(evn.target.value));
  favoritecloseBtn.addEventListener('click', hideFavorite);
  myprofilecloseBtn.addEventListener('click', hideMyprofile);
 
  myfavoriteBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    //showSearch();
     showMyfavorite();
   // alert("建设中");
  });
  myprofileBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    showMyprofile();
    //alert("我的都会，建设中");
  });
  
 
  let activeMenu = {};
  let result = [];
  let inputValue = '';
  let activeIndex = 0;
  
  document.addEventListener('keydown', (ev) => {
    const key = ev.key.toLocaleLowerCase();
    if (key === 'escape') {
      hideSearch();
    }
    if ((ev.metaKey || ev.ctrlKey) && key === 'k') {
      ev.preventDefault();
      searchBox.classList.contains('show') ? hideSearch() : showSearch();
    }
    if (key === 'enter') {
      const url = activeMenu.path || activeMenu?.item.path;
      window.location.href = getDocUrl(url);
    }
    if (key === 'arrowdown') {
      activeAnchorElm('down');
    }
    if (key === 'arrowup') {
      activeAnchorElm('up');
    }
  });
  
  function activeAnchorElm(type) {
    if (type === 'down') {
      ++activeIndex;
    }
    if (type === 'up') {
      --activeIndex;
    }
    const data = Array.from(searchMenu.children);
    if (activeIndex < 0) activeIndex = 0;
    if (activeIndex >= data.length) activeIndex = data.length - 1;
    anchorElm = data[activeIndex];
    if (anchorElm) {
      data.forEach((item) => item.classList.remove('active'));
      anchorElm.classList.add('active');
      activeMenu = result[activeIndex];
      activeIndex = activeIndex;
      searchSectionsResult(activeIndex);
    }
  }

  function showMyfavorite() {
    document.body.classList.add('ifavorite');
    favoriteBox.classList.add('show');
    favoritelist();
    //searchInput.focus();
  }
  function hideFavorite() {
    document.body.classList.remove('ifavorite');
    favoriteBox.classList.remove('show');
  }
  function hideMyprofile() {
    document.body.classList.remove('imyprofile');
    myprofileBox.classList.remove('show');
  }
  
  function showMyprofile() {
    document.body.classList.add('imyprofile');
    myprofileBox.classList.add('show');
    myprefilecho();
    //searchInput.focus();
  }


  
  function showSearch() {
    document.body.classList.add('search');
    searchBox.classList.add('show');
    searchResult(searchInput.value || '');
    searchInput.focus();
  }

  
  
  function hideSearch() {
    document.body.classList.remove('search');
    searchBox.classList.remove('show');
  }
  function getValueReg(val = '') {
    return new RegExp(val.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'ig');
  }
  
  function searchResult(value) {
    inputValue = value;
    result = fuse.search(value);
    if (!value) {
      result = REFS_DATA.map((item) => ({ item: item }));
    }
    let menuHTML = '';
    result.forEach((item, idx) => {
      const label = (item.item.name || '').replace(getValueReg(value), (txt) => {
        return `<mark>${txt}</mark>`;
      });
      const tags = (item.item.tags || []).join(',').replace(getValueReg(value), (txt) => {
        return `<mark>${txt}</mark>`;
      });
      const href = isHome ? item.item.path : item.item.path.replace('guides/', '');
      if (idx === 0) {
        activeIndex = idx;
        activeMenu = item.item;
        menuHTML += `<a href="${href}" class="active"><span>${label}</span><sup>${tags}</sup></a>`;
      } else {
        menuHTML += `<a href="${href}"><span>${label}</span><sup>${tags}</sup></a>`;
      }
    });
    searchMenu.innerHTML = menuHTML;
    searchSectionsResult();
    const data = Array.from(searchMenu.children);
    data.forEach((anchor, idx) => {
      anchor.onmouseenter = (evn) => {
        data.forEach((item) => item.classList.remove('active'));
        evn.target.classList.add('active');
        activeMenu = result[idx];
        activeIndex = idx;
        searchSectionsResult(idx);
      };
    });
    const anchorData = searchContent.querySelectorAll('a');
    Array.from(anchorData).forEach((item) => {
      item.addEventListener('click', hideSearch);
    });
  }
  function searchSectionsResult(idx = 0) {
    const data = result[idx] || [];
    const title = (data.item?.intro || '').replace(getValueReg(inputValue), (txt) => `<mark>${txt}</mark>`);
    let sectionHTML = `<h3>${title}</h3><ol>`;
    if (data && data.item && data.item.sections) {
      data.item.sections.forEach((item, idx) => {
        const label = item.t.replace(getValueReg(inputValue), (txt) => `<mark>${txt}</mark>`);
        const href = getDocUrl(data.item.path);
        if (item.l < 3) {
          sectionHTML += `<li><a href="${href + item.a}">${label}</a><div>`;
        } else {
          sectionHTML += `<a href="${href + item.a}">${label}</a>`;
        }
        if (data.item.sections.length === idx + 1) {
          sectionHTML += `</div></li>`;
        }
      });
    }
    searchContent.innerHTML = sectionHTML;
  }


  function getFavoriteData() {
    //通过从本地中获取元素，如果有内容，就将内容转成数组，否则就返回一个空的数组
      var data = localStorage.getItem('favoritem');
      if (data) {
        return JSON.parse(data);
      } else {
        return []
      }
    }
    function getFavoriteHTML() {
        //获取元素
        var data = getFavoriteData();
        donelist.innerHTML = ''
       // todolist.innerHTML = ''
        var donecounts = 0;
        var todocounts = 0;
        //将获取出来的元素进行遍历，并创建称为新的li，对数据中的done属性进行判读，done的属性决定改条数据是否是完成状态
        data.forEach((item, index) => {
          //if (item.done) {
            var newLi = `
            <li class="g-iFavoritem">
                <a href="/guides/${item.ectype}.html">
                <div class="g-iFavoritem_icon">
                <p><img src="/static/pictures/guidict/${item.ectype}.jpg" width="36px"></p>
                </div>
                <div class="g-iFavoritem_minfo">
                <p class="g-iFavoritem_minfo_tit">${item.title}</p>
                <p class="g-iFavoritem_minfo_type">${item.ectype}</p>
                </div>
                </a>
                
             </li>
            `
            donecounts++
    
            donelist.innerHTML += newLi
        });
        donecount.innerHTML = donecounts;
        //totdocount.innerHTML = todocounts;
    //<a data-index="${index}" href="javaScript:;"></a>     
    }

    function favoritelist(){
        getFavoriteHTML(); 
    }
    function addFavoritem(actype,title,ectype) {
      //input.addEventListener('keyup', function (e) {
        //if (e.keyCode == 13) {
          var Favoritedata = getFavoriteData();
          //将文本框中的内容放到data数组中
          Favoritedata.push({ title: title, ectype: ectype });
          
          //再将数据放在本地存储中
          localStorage.setItem('favoritem', JSON.stringify(Favoritedata));
         //最后将数据进行渲染页面
          getFavoriteHTML();
       // }
     // })
    }
    function getMyprofileData() {
        //通过从本地中获取元素，如果有内容，就将内容转成数组，否则就返回一个空的数组
          var data = localStorage.getItem('myprofiles');
          if (data) {
            return JSON.parse(data);
          } else {
            return []
          }
        }
   function getMyagendaData() {
            //通过从本地中获取元素，如果有内容，就将内容转成数组，否则就返回一个空的数组
              var data = localStorage.getItem('myagendas');
              if (data) {
                return JSON.parse(data);
              } else {
                return []
              }
            }
    function myprefilecho(){
        getMyprefileHTML(); 
        getMyagendaHTML(); 
    }

    function getMyprefileHTML() {
        //获取元素
        var data = getMyprofileData(); 
        profileInfo.innerHTML = ''
        // todolist.innerHTML = ''
         var profileincounts = 0;
         data.forEach((item, index) => {
            //if (item.done) {
              var newLi = `
              <li class="g-iFavoritem">
                  <a href="/wepage/my.html">
                  <div class="g-iFavoritem_icon">
                  <p><img src="/static/pictures/avat/${item.visitipic}.png" width="36px"></p>
                  </div>
                  <div class="g-iFavoritem_minfo">
                  <p class="g-iFavoritem_minfo_tit">${item.visititle}</p>
                  <p class="g-iFavoritem_minfo_type">本机ID</p>
                  </div>
                  </a>
                  
               </li>
              `
             profileincounts++
      
              profileInfo.innerHTML = newLi
          });
          if(profileincounts=="0"){
            //var newLi = 
             profileInfo.innerHTML = ("<li class=\"g-iFavoritem\">"+
             " <a href=\"/wepage/my.html\">"+
             " <div class=\"g-iFavoritem_icon\">"+
             " <p><img src=\"/static/pictures/guidict/hkcgi.jpg\" width=\"36px\"></p>"+
             "   </div>"+
             "  <div class=\"g-iFavoritem_minfo\">"+
             "<p class=\"g-iFavoritem_minfo_tit\">访客ID</p>"+
             "<p class=\"g-iFavoritem_minfo_type\"></p>"+
             "  </div>"+
             " </a>"+
             " </li>")
          }

     }

     function getMyagendaHTML() {
        //获取元素
        var data = getMyagendaData(); 
        myagendaList.innerHTML = '<div class="myagendatabs" id="myagendatabs"><div class="myagendatabs_tit">待办事项</div></div><div class="myagendaitem" id="myagendaitem"></div>'
        // todolist.innerHTML = ''
         var agendaicounts = 0;
         var myagendaitem = document.getElementById('myagendaitem'); 
         data.forEach((item, index) => {
            //if (item.done) {
              var newLi = `
              <li class="g-iFavoritem">
                  <a href="/guides/${item.ectype}.html">
                  <div class="g-iFavoritem_icon">
                  <p><img src="/static/pictures/guidict/${item.ectype}.jpg" width="36px"></p>
                  </div>
                  <div class="g-iFavoritem_minfo">
                  <p class="g-iFavoritem_minfo_tit">${item.title}</p>
                  <p class="g-iFavoritem_minfo_type">${item.ectype}</p>
                  </div>
                  </a>
                  
               </li>
              `
              agendaicounts++
      
              pmyagendaitem.innerHTML = newLi
          });
          if(agendaicounts=="0"){
            //var newLi = 
            myagendaitem.innerHTML = ("<div class=\"myagendaerrnotion\">未添加待办</div>")
          }

     }

     inputodoadd.addEventListener('click', function (e) {
        //if (e.keyCode == 13) {
          var data = getMyagendaData();
          //将文本框中的内容放到data数组中
          data.push({ title: inputodo.value, done: false })
         // this.value = ''
          //再将数据放在本地存储中
          localStorage.setItem('myagendas', JSON.stringify(data))
         //最后将数据进行渲染页面
         getMytodoHTML()
       // }
      })


    function mytodoecho(){
       // getMyprefileHTML(); 
      
        getMytodoHTML(); 
    }


    function getMytodoHTML() {
        //获取元素
     
        var data = getMyagendaData(); 
       
        todonelist.innerHTML = '';
        
        todolist.innerHTML = '';
        var donecounts = 0;
        var todocounts = 0;
       // alert("d");
        //将获取出来的元素进行遍历，并创建称为新的li，对数据中的done属性进行判读，done的属性决定改条数据是否是完成状态
        data.forEach((item, index) => {
          if (item.done) {
            var newLi = `
            <li >
                <input data-index="${index}" type="checkbox" checked>
                <p>${item.title}</p>
                <a data-index="${index}" href="javaScript:;">X</a>
             </li>
            `
            donecounts++
    
            todonelist.innerHTML += newLi
          } else {
            var newLi = `
            <li >
                <input data-index="${index}" type="checkbox" >
                <p>${item.title}</p>
                <a data-index="${index}" href="javaScript:;">X</a>
             </li>
            
            `
            todocounts++;
            todolist.innerHTML += newLi
          }
    
        });
        todonecount.innerHTML = donecounts;
        todocount.innerHTML = todocounts;
        
     }

     todocontent.addEventListener('change', function (e) {
        //如果触发事件的元素的类型是复选框
      if (e.target.type == 'checkbox') {
        //  alert("v");
      //对触发的复选框进行判断，如果点击之后复选框的checked是true，说明该任务已完成
        if (e.target.checked) {
        //就需要将该条数据中的done属性进行更改，那么我们怎么知道点击的数据在data中处在哪个位置
          var data = getMyagendaData();
          //自定义属性，可以在点击时获取，那么修改的也应该是数组中的index值
          var index = e.target.getAttribute('data-index');
          console.log(index);
          //修改属性，然后将数据存放在本地存储
          data[index].done = e.target.checked
          localStorage.setItem('myagendas', JSON.stringify(data))
          //渲染页面
          getMytodoHTML()
        }
        //这个是和上面是相反的，如果点击之后的checked是false，就是表示未完成
        if (!e.target.checked) {
          var data = getMyagendaData();
          var index = e.target.getAttribute('data-index');
          console.log(index);
          data[index].done = e.target.checked
          localStorage.setItem('myagendas', JSON.stringify(data))
          getMytodoHTML()
        }
      }
    })

    function tododelate() {
        todocontent.addEventListener('click', function (e) {   
          if (e.target.type == '') {
            var data = getMyagendaData();
            //怎么知道自己点击的是第几个？可以获取设置的自定义属性
            var index = e.target.getAttribute('data-index');
            //通过数组splice方法删除指定元素
            data.splice(index, 1)
            //存储
            localStorage.setItem('myagendas', JSON.stringify(data))
            //渲染页面
            getMytodoHTML()
          }
        })
      }
      tododelate()
