  function cell_action(e) {
//    e.currentTarget.classList.toggle("cell--theme")
//    data_save()
    document.getElementById("notepad").classList.remove("_hidden")
  }

  function exec_command(line) {
    let ary = Array.from(line.trim())
    let action = ary.shift()
    if(action == 'i') {
      let area = ary.shift()
      let cell = ary.shift()
      let alt = ary.join('')
      if("wersdfzxc".includes(area) && "wersdfzxc".includes(cell)) {
        document.getElementById(`cell-${area}${cell}`).getElementsByClassName("content--cell--title")[0].innerHTML = alt
      }
    }
    if(action == ':') {
      if("clear" == ary.join('')) {
        Array.from(document.getElementsByClassName("content--cell--title")).forEach(c => c.innerHTML = null)
      }
    }
    document.getElementById("command").value = null
    data_save()
  }

  // Format of JSON:
  //  [
  //    {
  //      "title": "FirstPage",
  //      "notes": [
  //        { "id": "cell-ww", "showName": "TEST", "class": "cell--theme" },
  //        { "id": "cell-we", "showName": "TEST2", "class": "cell--theme" },
  //      ]
  //    }, 
  //    {
  //      "title": "SecondPage",
  //      "notes": [
  //        { "id": "cell-ww", "showName": "TEST", "class": "cell--theme" },
  //        { "id": "cell-we", "showName": "TEST2", "class": "cell--theme" },
  //      ]
  //    }, 
  //  ]

  function to_json() {
      let data = []
      let notes = []
      let page = {"title": "Sample", "notes": notes}
      data.push(page)
      Array.from(document.getElementsByClassName("cell")).forEach( cell => {
          notes.push({
              "id": cell.id, 
              "showName": cell.getElementsByClassName("content--cell--title")[0].innerHTML || "",
              "class": cell.classList.value || "",
              "text": cell.getElementsByClassName("content--cell--text")[0].innerHTML || ""})
        }
      )
      return data
  }

  function data_save() {
    let data = to_json()
    let json = JSON.stringify(data)
    localStorage.setItem("mandala", json)
  }

  function data_load() {
    let pages = JSON.parse(localStorage.getItem("mandala"))
    if(! pages) return false
    pages.forEach(page => {
      page.notes.forEach(note => {
        let cell = document.getElementById(note.id)
        if(! cell) return
        cell.getElementsByClassName("content--cell--title")[0].innerHTML = note.showName || ""
        if(note.class) {
            note.class.split(/ +/).forEach(cls => cell.classList.add(cls))
        }
        cell.getElementsByClassName("content--cell--text")[0].innerHTML = note.text || ""
      })
    })
    return true
  }

  function data_init() {
    Array.from(document.getElementsByClassName("content--cell--title")).forEach(cell => cell.innerHTML="テスト")
    document.querySelectorAll("[id^=cell][id$=d]").forEach(cell => cell.classList.add("cell--theme"))
  }

  function fixed_panel_size() {
    let panels = [
      ["backboard", "98%", "98%"],
      ["top", "100%", "3em"],
      ["middle", "100%", "100%"],
      ["bottom", "100%", "3em"],
      ["left", "12em", null],
      ["center", null, null],
      ["right", "12em", null]
    ]
    panels.forEach(ary => {
      let _e = document.getElementById(ary[0])
      _e.style.width = ary[1]
      _e.style.height = ary[2]

      _e.style.width = getComputedStyle(_e).width
      _e.style.height = getComputedStyle(_e).height
    })
  }

  function resize_window() {
      fixed_panel_size()
  }

  function init() {
    let center = document.getElementById("center")
    let area = document.createElement("div")
    area.className = "area"

    let cell = document.createElement("div")
    cell.className = "cell cell--common shadow"
    let tag = document.createElement("div")
    tag.className = "tag--cell--id"
    cell.appendChild(tag)
    let text = document.createElement("div")
    text.className = "content--cell--text _hidden"
    cell.appendChild(text)
    let content = document.createElement("div")
    content.className = "content--cell--title"
    content.innerHTML = "content"
    cell.appendChild(content)

    let cell_ids = "wersdfzxc"
    for(let i = 0; i < 9; i++) {
      let c = cell.cloneNode(true)
      c.setAttribute("id", `cell-N${cell_ids[i]}`)
      area.appendChild(c)
    }

    for(let i = 0; i < 9; i++) {
      let a = area.cloneNode(true)
      a.setAttribute("id", `area-${cell_ids[i]}`)
      Array.from(a.getElementsByClassName("cell")).forEach(cell => cell.setAttribute("id", cell.id.replace("N", cell_ids[i])))
      center.appendChild(a)
    }

    Array.from(document.getElementsByClassName("tag--cell--id")).forEach( t => {
      let value = /..$/.exec(t.parentNode.id)[0]
      t.innerHTML = value
      }
    )

    Array.from(document.getElementsByClassName("cell")).forEach(cell => cell.addEventListener("click", cell_action))
    fixed_panel_size()

    window.addEventListener("resize", resize_window)

    if(! data_load()) {
      data_init()
      data_save()
    }

    let command = document.getElementById("command")
    command.addEventListener("input", e => {
      let line = e.currentTarget.value
      let arrows = ["qwesdfzxc"]
      if(line.length == 2) {
        let cell = document.getElementById(`cell-${line}`)
        if(cell) {
          // cell.classList.toggle("cell--theme")
          e.currentTarget.value = null
          document.getElementById("content--notepad--textarea").value = cell.getElementsByClassName("content--cell--text")[0].innerHTML
          document.getElementById("notepad").classList.remove("_hidden")
          document.getElementById("content--notepad--textarea").focus()
          Array.from(document.getElementsByClassName("cell--current")).forEach(c => c.classList.remove("cell--current"))
          cell.classList.add("cell--current")
        }
      } else {
        if(line.length == 1) {
          if(line == "t") {
            Array.from(document.getElementsByClassName("tag--cell--id")).forEach(t => t.classList.toggle("_hidden"))
            e.currentTarget.value = null
          }
        }
      }
    })
    command.focus()
    window.addEventListener("keydown", (e)=>{
      const keycode = e.keyCode;
      const code  = e.code;
      const onShift = e.shiftKey;
      const onCtrl  = e.ctrlKey;
      const onAlt   = e.altKey;
      const onMeta  = e.metaKey;

      let command = document.getElementById("command")

      if(e.isComposing) return

      // コマンドを削除し、コマンドにフォーカスを当てる
      if(code == "Escape") {
        // テキストエリアを閉じる（ついでにテキストをDOMへ保存）
        if(document.activeElement === document.getElementById("content--notepad--textarea")) {
          let notepad = document.getElementById("notepad")
          notepad.classList.add("_hidden")
          document.getElementById("command").focus()
          let cell = document.getElementsByClassName("cell--current")[0]
          cell.getElementsByClassName("content--cell--text")[0].innerHTML = document.getElementById("content--notepad--textarea").value
          data_save()
        } else {
          command.focus()
          command.value = null
          e.preventDefault()
        }
      }
      // コマンドにフォーカスを当てる
      if(code == "Space") {
        if(document.activeElement !== command) {
          command.focus()
          e.preventDefault()
        }
      }
      // コマンドを実行し、コマンドを削除する（フォーカスがコマンドに当たっている場合）
      if(code == "Enter") {
        if(document.activeElement === command) {
          exec_command(command.value)
          command.value = null
          e.preventDefault()
        }
      }
    });
  }
  window.onload = init;