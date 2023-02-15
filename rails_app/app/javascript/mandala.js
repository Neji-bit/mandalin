const ADDRESS = "wersdfzxc"
const STORAGE_NAME = "mandala"

// JQueryライクのDOM検索メソッドを自前で実装。
class Selector {
  static exec = (keyword, from = document) => {
    let selectors = {'#': "getElementById", '.': "getElementsByClassName", '*': "querySelectorAll"}
    let arg = keyword.split('')
    let type = arg.shift()
    let selector = selectors[type]
    if(! selector) return null
    let elm = from[selector](arg.join(''))
    if(elm instanceof HTMLCollection) {
      if(elm.length == 0) return []
      return [...elm]
    }
    return elm
  }
}
let _$ = (selector, from = document) => Selector.exec(selector, from)
let _$id = (selector, from = document) => from.getElementById(selector)
let _$cls = (selector, from = document) => [...from.getElementsByClassName(selector)]
let _$q = (selector, from = document) => [...from.querySelectorAll(selector)]


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
class Data {
  static init = () => {
    _$(".content--cell--subject").forEach(cell => cell.innerHTML="テスト")
    _$("*[id^=cell][id$=d]").forEach(cell => cell.classList.add("cell--theme"))
  }

  //  ストレージからの単純な読み取りだけ。
  static read = () => {
    return JSON.parse(localStorage.getItem(STORAGE_NAME))
  }

  //  データをアプリに反映する。
  static apply = (json) => {
    _$("#right").innerHTML = null
    json.forEach(page => {
      page.notes.forEach(note => {
        let cell = _$id(note.id)
        if(! cell) return
        _$(".content--cell--subject", cell)[0].innerHTML = note.showName || ""
        if(note.class) {
          note.class.split(/ +/).forEach(cls => cell.classList.add(cls))
        }
        _$(".content--cell--note", cell)[0].innerHTML = note.text || ""
      })
      let _page = document.createElement("div")
      _page.className = "page shadow"
      _page.innerHTML = page.title
      _$("#right").appendChild(_page)
    })
  }

  //  データの読み取り＆アプリへの適用をセットで行う。
  static load = () => {
    let json = this.read()
    if(! json) return false
    this.apply(json)
    return true
  }

  //  ストレージへの書き込み。
  static write = (json) => {
    localStorage.setItem(STORAGE_NAME, JSON.stringify(json))
  }

  //  アプリ情報を保存する。
  static save = () => {
    let json = this.#to_json()
    Data.write(json)
  }

  static #to_json = () => {
    let data = []
    let notes = []
    let page = {"title": "Sample", "notes": notes}
    data.push(page)
    _$(".cell").forEach( cell => {
      notes.push({
        "id": cell.id, 
        "showName": _$(".content--cell--subject", cell)[0].innerHTML || "",
        "class": cell.classList.value || "",
        "text": _$(".content--cell--note", cell)[0].innerHTML || ""
      })
    })
    return data
  }
}

class Command {
  static init = () => {
    this.#initCommandLine()
    this.#initListenKey()
  }

  static #initCommandLine = () => {
    let command = _$("#command")
    command.addEventListener("input", e => {
      let line = e.currentTarget.value
      //  セルフォーカスの処理
      if(line.length == 2) {
        //  大小マップの切り替え。qq: 大マップ。qs： 小マップ（エリアs）。
        if(line[0] == 'q') {
          e.currentTarget.value = null
          let area_code = line[1]
          if(area_code == 'q') {
            Map.large()
          } else {
            let area = _$(`#area-${area_code}`)
            if(area) {
              Area.focus(area)
              Map.small()
            }
          }
        } else {
        let cell = _$(`#cell-${line}`)
          if(cell) {
            // cell.classList.toggle("cell--theme")
            e.currentTarget.value = null
            _$("#content--notepad--textarea").value = _$(".content--cell--note", cell)[0].innerHTML
            _$("#notepad").classList.remove("_hidden")
            _$("#content--notepad--textarea").focus()
            Cell.focus(cell)
            Area.focus(cell.parentNode)
          }
        }
      }
    })
  }

  static #initListenKey = () => {
    window.addEventListener("keydown", (e)=>{
      const keycode = e.keyCode;
      const code  = e.code;
      const onShift = e.shiftKey;
      const onCtrl  = e.ctrlKey;
      const onAlt   = e.altKey;
      const onMeta  = e.metaKey;

      let command = _$("#command")

      // 日本語変換中のキータイプは無視する
      if(e.isComposing) return

      // コマンドを削除し、コマンドにフォーカスを当てる
      if(code == "Escape") {
        // テキストエリアを閉じる（ついでにテキストをDOMへ保存）
        if(document.activeElement === _$("#content--notepad--textarea")) {
          let notepad = _$("#notepad")
          notepad.classList.add("_hidden")
          _$("#command").focus()
          _$(".content--cell--note", Cell.current())[0].innerHTML = _$("#content--notepad--textarea").value
          Data.save()
        } else {
          command.focus()
          command.value = null
          e.preventDefault()
        }
        return
      }
//      if(code == "Space") {
//        let active = document.activeElement
//        // コマンドにフォーカスを当てる
//        if(Display.is_normal()) {
//          //  コマンドにフォーカスが当たっている時は、普通にスペース入力として解釈する。
//          if(active !== command) {
//            command.focus()
//            e.preventDefault()
//          }
//          return
//        }
//        //  テキスト入力時のスペース処理
//        if(active.classList.contains("content--cell--subject") || active.classList.contains("content--cell--note")) {
//          let text = active.innerHTML
//          let selection = window.getSelection()
//          console.log(selection)
//          let caret = [selection.anchorOffset, selection.focusOffset].sort()
//          active.innerHTML = text.substr(0, caret[0]) + " " + text.substr(caret[1])
//          let range = document.createRange()
//          range.setStart(active.firstChild, caret[0] + 1)
//          range.setEnd(active.firstChild, caret[0] + 1)
//          selection.removeAllRanges()
//          selection.addRange(range)
//          e.preventDefault()
//          return
//        }
//        return
//      }
      if(code == "Enter") {
        // コマンドを実行し、コマンドを削除する（フォーカスがコマンドに当たっている場合）
        if(document.activeElement === command) {
          Command.exec(command.value)
          command.value = null
          e.preventDefault()
        }
        //  ちょっと無理やり実装。
        //  セル（=contenteditable）への直接入力時、Enterを「ただの改行コード入力」に差し替える。
        if(code == "Enter") {
          let active = document.activeElement
          if(active.classList.contains("content--cell--subject") || active.classList.contains("content--cell--note")) {
            let text = active.innerHTML
            let selection = window.getSelection()
            let caret = [selection.anchorOffset, selection.focusOffset].sort()
            console.log(caret)
            active.innerHTML = text.substr(0, caret[0]) + "\n" + text.substr(caret[1])
            let range = document.createRange()
            range.setStart(active.firstChild, caret[0] + 1)
            range.setEnd(active.firstChild, caret[0] + 1)
            selection.removeAllRanges()
            selection.addRange(range)
            e.preventDefault()
          }
          return
        }
        return
      }

      //  '@' + Ctrl: 全画面表示
      if(code == "BracketLeft" && onCtrl) {
        Display.toggle()
        e.preventDefault()
        return
      }

      //  '[' + Ctrl: データ読み込みテキストエリアの表示
      if(code == "BracketRight" && onCtrl) {
        e.preventDefault()
        if(_$("#import_export").classList.contains("_hidden")) {
          _$("#import_export").classList.remove("_hidden")
          //  丁寧なカーソル当て
          _$("#import_export").value = null
          _$("#import_export").focus()
          let strings = JSON.stringify(Data.read(), null, "  ")
          _$("#import_export").value = strings
        } else {
          let json
          try {
            json = JSON.parse(_$("#import_export").value)
            _$("#import_export").classList.add("_hidden")
            Data.write(json)
            Data.load()
          } catch(e) {
            console.log("JSON.parseに失敗しました")
          }
        }
        return
      }
      //  タグの表示／非表示切り替え
      if(code == "KeyT" && onCtrl) {
        _$(".tag--cell--id").forEach(t => t.classList.toggle("_hidden"))
        e.currentTarget.value = null
        return
      }
    })
  }

  static exec = (line) => {
    let ary = Array.from(line.trim())
    let action = ary.shift()
    if(action == 'i') {
      let area = ary.shift()
      let cell = ary.shift()
      let alt = ary.join('')
      if(ADDRESS.includes(area) && ADDRESS.includes(cell)) {
        _$(".content--cell--subject", _$(`#cell-${area}${cell}`))[0].innerHTML = alt
      }
    }
    if(action == ':') {
      let command = ary.join('')
      let tmp
      if("clear" == command) {
        _$(".content--cell--subject").forEach(c => c.innerHTML = null)
      }
      if(tmp = /backup(.*)/.exec(command)) {
        let backupName = tmp[1].trim()
        localStorage.setItem(`${STORAGE_NAME}_${backupName}`, localStorage.getItem(STORAGE_NAME))
      }
    }
    _$("#command").value = null
    Data.save()
  }
}

class Display {
  //  お決まりのDOM一式を生成する。
  static init = () => {
    let map_large = _$("#map_large")

    //  エリアのひな形を作成
    let area = document.createElement("div")
    area.className = "area"

    //  セルのひな形を作成
    let cell = document.createElement("div")
    cell.className = "cell cell--common shadow"
    let tag = document.createElement("div")
    tag.className = "tag--cell--id"
    cell.appendChild(tag)
    let subject = document.createElement("div")
    subject.className = "content--cell--subject"
    subject.setAttribute("contenteditable", true)
    cell.appendChild(subject)
    let text = document.createElement("div")
    text.className = "content--cell--note"
    text.setAttribute("contenteditable", true)
    cell.appendChild(text)

    //  １エリア分のセルを複製する
    for(let i = 0; i < ADDRESS.length; i++) {
      let c = cell.cloneNode(true)
      c.setAttribute("id", `cell-N${ADDRESS[i]}`)
      area.appendChild(c)
    }

    //  エリアを９つ複製する
    for(let i = 0; i < ADDRESS.length; i++) {
      let a = area.cloneNode(true)
      a.setAttribute("id", `area-${ADDRESS[i]}`)
      _$(".cell", a).forEach(cell => cell.setAttribute("id", cell.id.replace("N", ADDRESS[i])))
      map_large.appendChild(a)
    }

    //  セルタグの値を設定する
    _$(".tag--cell--id").forEach( t => {
      let value = /..$/.exec(t.parentNode.id)[0]
      t.innerHTML = value
      }
    )
  }

  //  画面上のパネルのサイズを固定させる（＝ピクセルサイズ指定にする）。
  //  これをすることで、セルに文字溢れがあってもセルのサイズが変わらなくなる。
  static fixed_panel_size = () => {
    let panels = [
      ["backboard", "98%", "98%"],
      ["top", "100%", "3em"],
      ["middle", "100%", "100%"],
      ["bottom", "100%", "3em"],
      ["left", "12em", null],
      ["center", null, null],
      ["right", "12em", null]
    ]
    //  いったん、サイズをなくす。
    panels.forEach(ary => {
      let _e = _$id(ary[0])
      _e.style.width = null
      _e.style.height = null
    })
    //  改めてサイズを再設定＆固定化。
    panels.forEach(ary => {
      let _e = _$id(ary[0])
      _e.style.width = ary[1]
      _e.style.height = ary[2]

      _e.style.width = getComputedStyle(_e).width
      _e.style.height = getComputedStyle(_e).height
    })
  }

  static resize_window = () => {
    this.fixed_panel_size()
  }

  //  フルスクリーン表示
  static full = () => {
    _$("#top").classList.add("_hidden")
    _$("#left").classList.add("_hidden")
    _$("#right").classList.add("_hidden")
    this.fixed_panel_size()
  }

  //  通常表示
  static normal = () => {
    _$("#top").classList.remove("_hidden")
    _$("#left").classList.remove("_hidden")
    _$("#right").classList.remove("_hidden")
    this.fixed_panel_size()
  }

  static toggle = () => {
    if(_$("#top").classList.contains("_hidden")) {
      this.normal()
    } else {
      this.full()
    }
  }

  //  現在の表示モードを返す（暫定版）
  static is_normal = () => {
    //  特別なテキストエリアを表示している場合は、ノーマルモードではない。
    if(! _$("#notepad").classList.contains("_hidden")) return false
    if(! _$("#import_export").classList.contains("_hidden")) return false
    //  入力を行っている時は、ノーマルモードではない。
    if(document.activeElement.tagName != "BODY") return false
    return true
  }
}

function cell_action(e) {
//    e.currentTarget.classList.toggle("cell--theme")
//    Data.save()
//  _$("#notepad").classList.remove("_hidden")
}

function init() {
  Display.init()
  Display.fixed_panel_size()
  window.addEventListener("resize", Display.resize_window)

  _$(".cell").forEach(cell => cell.addEventListener("click", cell_action))

  if(! Data.load()) {
    Data.init()
    Data.save()
  }

  Command.init()
  command.focus()
  let _json = {"subject": "sub", "note": "not", "tags": [{"tagName": "tag"}]}
  let _c = new Cell(_$("#cell-ww").id, _json)

  //  let page = new Page(json)
  //  page.areas
  //  page.cells
  //  page.areas["a"].cells
  //  _$("#cell-ww").instance.parent.parent

}
window.onload = init;

class Page {
  static current = () => {
    return _$q(".page.current")[0]
  }
  static focus = (dom) => {
    this.unfocus()
    dom.classList.add("current")
  }
  static unfocus = () => {
    let current = this.current()
    if(current) current.classList.remove("current")
  }
}

class Map {
  static current = () => {
    return _$q(".map.current")[0]
  }
  static focus = (dom) => {
    this.unfocus()
    dom.classList.add("current")
    dom.classList.remove("_hidden")
  }
  static unfocus = () => {
    let current = this.current()
    if(current) {
      current.classList.remove("current")
      current.classList.add("_hidden")
    }
  }
  //  大マップを表示する
  static large = () => {
    this.unfocus()
    this.focus(_$("#map_large"))
    this.refresh()
  }
  //  小マップを表示する
  static small = () => {
    this.unfocus()
    this.focus(_$("#map_small"))
    this.refresh()
  }
  //  大マップ／小マップを切り替える
  static toggle = () => {
    let map = this.current()
    map && map.id == "map_large" ? this.small() : this.large()
  }
  //  画面上のマップを再描画
  static refresh = () => {
    if(this.current().id == "map_large") {
      let small = _$("#map_small")
      let large = _$("#map_large")
      let area = small.firstChild
      if(! area) return
      this.removeKeeper(area)
    }
    if(this.current().id == "map_small") {
      let large = _$("#map_large")
      let small = _$("#map_small")
      let small_area = small.firstChild
      let area = Area.current()
      if(! area) return
      //  小マップ状態から小マップを開く時は、一度大マップのキーパーを解除する
      if(small_area) this.removeKeeper(small_area)
      //  大マップにあるエリアを小マップに移す
      this.setKeeper(area)
      small.appendChild(area)
    }
  }
  // 指定されたエリアのDOMを抽出し、代わりにキーパーをセットする
  static setKeeper = (area) => {
    let keeper = document.createElement("div")
    keeper.id = "area_keeper"
    area.after(keeper)
    return area
  }
  // キーパーの位置に指定されたDOMを挿入し、キーパーを削除する
  static removeKeeper = (area) => {
    let keeper = _$("#area_keeper")
    if(! keeper) return
    keeper.after(area)
    keeper.remove()
  }
}

class Area {
  static current = () => {
    return _$q(".area.current")[0]
  }
  static focus = (dom) => {
    this.unfocus()
    dom.classList.add("current")
  }
  static unfocus = () => {
    let current = this.current()
    if(current) current.classList.remove("current")
  }
}

class Cell {
  static current = () => {
    return _$q(".cell.current")[0]
  }
  static focus = (dom) => {
    this.unfocus()
    dom.classList.add("current")
  }
  static unfocus = () => {
    let current = this.current()
    if(current) current.classList.remove("current")
  }
}

