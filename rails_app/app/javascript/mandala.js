//  定数系  {
const ADDRESS = "wersdfzxc"
const PAGE_ADDRESS = "0123456789abcdef"
const STORAGE_NAME = "mandala"
//  }

// JQueryライクのDOM検索メソッドを自前で実装。  {
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
//  }

class MasterData {
  static data = null

  //  マスターデータを読み込む。以降は MasterData.data を参照すること。
  static load = () => {
    try {
      this.data = JSON.parse(localStorage.getItem(STORAGE_NAME))
    } catch(e) {
      return false
    }
    return this.data
  }

  //  マスターデータを初期化する。ストレージへの保存も行う。
  static init = () => {
    let json = {}
    json.pages = []
    PAGE_ADDRESS.split("").forEach(a => {
      json.pages.push("")
    })
    json.currentPage = 0
    localStorage.setItem(STORAGE_NAME, JSON.stringify(json))
    this.load()
  }

  //  MasterData.data をストレージに保存する。
  static save = () => {
    localStorage.setItem(STORAGE_NAME, JSON.stringify(this.data))
  }

  //  マスターデータ（＝ページ）を画面に適用。
  static apply = () => {
    this.data.pages.forEach((page, index) => {
      _$("#right").children[index].children[1].innerHTML = page
    })
  }
}

//  ページデータの保存／読み出し機能。
class PageData {
  //  ページ用のJSONを生成する。
  static jsonFormat = () => {
    let json = {"notes": [], "title": ""}
    ADDRESS.split("").forEach(a => {
      ADDRESS.split("").forEach(c => {
        json.notes.push({
          "id": `cell-${a}${c}`,
          "showName": "",
          "class": "cell cell--common shadow",
          "text": ""})
      })
    })
    return json
  }

  //  ストレージからの単純な読み取りだけ。
  static read = (pageId) => {
    let json = localStorage.getItem(`${STORAGE_NAME}_${pageId}`)
    try {
      return JSON.parse(json)
    } catch(e) {
      return null
    }
  }

  //  データをアプリに反映する。
  static apply = (json) => {
    json.notes.forEach(note => {
      let cell = _$id(note.id)
      if(! cell) return
      _$(".content--cell--_subject", cell)[0].value = note.showName || ""
      _$(".content--cell--subject", cell)[0].innerHTML = _$(".content--cell--_subject", cell)[0].value
      if(note.class) {
        note.class.split(/ +/).forEach(cls => cell.classList.add(cls))
      }
      _$(".content--cell--_note", cell)[0].value = note.text || ""
      _$(".content--cell--note", cell)[0].innerHTML = _$(".content--cell--_note", cell)[0].value
    })
    MasterData.apply()
    //  セルの表示更新
    _$(".cell").forEach(e => { Cell.refresh(e) })
  }

  //  データの読み取り＆アプリへの適用をセットで行う。
  static load = (pageId) => {
    let json = this.read(pageId)
    if(! json) {
      this.write(PageData.jsonFormat(), `${STORAGE_NAME}_${pageId}`)
      json = this.read(pageId)
    }
    this.apply(json)
    //  アンドゥ履歴に現状を初期値として設定。
    Undo.init(JSON.stringify(json))
    return true
  }

  //  ストレージへの書き込み。
  static write = (json, storageName = STORAGE_NAME) => {
    localStorage.setItem(storageName, JSON.stringify(json))
    Undo.push(JSON.stringify(json))
  }

  //  アプリ情報を保存する。
  static save = (pageId) => {
    let json = this.#toJson()
    PageData.write(json, `${STORAGE_NAME}_${pageId}`)
  }

  static #toJson = () => {
    let notes = []
    let page = {"title": "Sample", "notes": notes}
    _$(".cell").forEach( cell => {
      notes.push({
        "id": cell.id, 
        "showName": _$(".content--cell--_subject", cell)[0].value || "",
        "class": cell.classList.value || "",
        "text": _$(".content--cell--_note", cell)[0].value || ""
      })
    })
    return page
  }
}

//  コマンド処理。
//  コマンドライン系と
//  ホットキー系の両方をまとめて書いている。
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
        } else if(line[0] == '/') {
          //  ページを開く
          let subcmd = line[1]
          if(PAGE_ADDRESS.includes(subcmd)) {
            Page.specify(subcmd)
            MasterData.data.currentPage = subcmd
            MasterData.save()
            e.currentTarget.value = null
          }
        } else {
        let cell = _$(`#cell-${line}`)
          //  セルを開く
          if(cell) {
            let wrap = _$(".content--cell--wrap--subject", cell)[0]
            Cell.focusSubject(wrap)
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
          PageData.save(Page.currentId())
        } else {
          command.focus()
          command.value = null
          e.preventDefault()
        }
        return
      }
      if(code == "Enter") {
        // コマンドを実行し、コマンドを削除する（フォーカスがコマンドに当たっている場合）
        if(document.activeElement === command) {
          Command.exec(command.value)
          command.value = null
          e.preventDefault()
        } else {
        //  ちょっと無理やり実装。
        //  セル（=contenteditable）への直接入力時、Enterを「ただの改行コード入力」に差し替える。
          let active = document.activeElement
          if(active.classList.contains("content--cell--subject") || active.classList.contains("content--cell--note")) {
            let text = active.innerHTML
            let selection = window.getSelection()
            let caret = [selection.anchorOffset, selection.focusOffset].sort()
            let left = text.substr(0, caret[0])
            let right = text.substr(caret[1])
            active.innerHTML = left + "\n" + right
            let range = document.createRange()
            range.setStart(active.firstChild, caret[0] + 1)
            range.setEnd(active.firstChild, caret[0] + 1)
            selection.removeAllRanges()
            selection.addRange(range)
            e.preventDefault()
          }
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
          let strings = JSON.stringify(PageData.read(MasterData.data.currentPage), null, "  ")
          _$("#import_export").value = strings
        } else {
          let json
          try {
            json = JSON.parse(_$("#import_export").value)
            _$("#import_export").classList.add("_hidden")
            PageData.write(json, `${STORAGE_NAME}_${MasterData.data.currentPage}`)
            PageData.load(Page.currentId())
            MasterData.apply()
          } catch(e) {
            console.log("JSON.parseに失敗しました")
          }
        }
        return
      }
      //  タグの表示／非表示切り替え
      if(code == "KeyT" && onCtrl) {
        CellIdTag.toggle()
        e.currentTarget.value = null
        return
      }
      //  コマンド履歴
      if(code == "KeyI" && onCtrl) {
        let history = History.prev()
        if(typeof history.command == "string") _$("#command").value = history.command
        return
      }
      if(code == "KeyK" && onCtrl) {
        let history = History.next()
        if(typeof history.command == "string") _$("#command").value = history.command
        return
      }
      //  アンドゥ／リドゥ
      if(code == "KeyU" && onCtrl) {
        let json = Undo.undo()
        if(json) PageData.apply(JSON.parse(json))
        return
      }
      if(code == "KeyJ" && onCtrl) {
        let json = Undo.redo()
        if(json) PageData.apply(JSON.parse(json))
        return
      }
    })
  }

  //  コマンドの解釈と実行
  static exec = (line) => {
    let ary = Array.from(line.trim())
    let action = ary.shift()
    if(action == 'i') {
      let area = ary.shift()
      let cell = ary.shift()
      let alt = ary.join('')
      if(ADDRESS.includes(area) && ADDRESS.includes(cell)) {
        let subject = _$(".content--cell--subject", _$(`#cell-${area}${cell}`))[0]
        let _subject = _$(".content--cell--_subject", _$(`#cell-${area}${cell}`))[0]
        _subject.value = alt
        subject.innerHTML = _subject.value
      }
    }
    //  長ものコマンド
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
    //  ページ系
    if(action == '/') {
      let subcmd = ary.shift()
      //  リネーム
      if(subcmd == '/') {
        let page = ary.shift()
        if(PAGE_ADDRESS.includes(page)) {
          MasterData.data.pages[parseInt(page, 16)] = ary.join("")
          MasterData.save()
          MasterData.apply()
        }
      }
      //  入れ替え
      if(subcmd == '_') {
        let left = ary.shift()
        let right = ary.shift()
        if(PAGE_ADDRESS.includes(left) && PAGE_ADDRESS.includes(right)) {
          let _left = parseInt(left, 16)
          let _right = parseInt(right, 16)
          let leftPage = PageData.read(left)
          let rightPage = PageData.read(right)
          let leftName = MasterData.data.pages[_left]
          let rightName = MasterData.data.pages[_right]
          MasterData.data.pages[_right] = leftName
          MasterData.data.pages[_left] = rightName
          MasterData.save()
          PageData.write(leftPage, `${STORAGE_NAME}_${right}`)
          PageData.write(rightPage, `${STORAGE_NAME}_${left}`)
          PageData.load(Page.currentId())
          MasterData.apply()
        }
      }
      //  コピー
      if(subcmd == '>') {
        let left = ary.shift()
        let right = ary.shift()
        if(PAGE_ADDRESS.includes(left) && PAGE_ADDRESS.includes(right)) {
          let leftPage = PageData.read(left)
          let rightPage = PageData.read(right)
          let _left = parseInt(left, 16)
          let _right = parseInt(right, 16)
          let leftName = MasterData.data.pages[_left]
          let rightName = MasterData.data.pages[_right]
          MasterData.data.pages[_right] = leftName
          MasterData.save()
          PageData.write(leftPage, `${STORAGE_NAME}_${right}`)
          PageData.load(Page.currentId())
          MasterData.apply()
        }
      }
      //  初期化
      if(subcmd == '-') {
        ary.forEach(p => {
          if(PAGE_ADDRESS.includes(p)) {
            PageData.write(PageData.jsonFormat(), `${STORAGE_NAME}_${p}`)
            MasterData.data.pages[parseInt(p, 16)] = ""
            MasterData.save()
            PageData.load(Page.currentId())
            MasterData.apply()
          }
        })
      }
    }
    //  エリア系
    if(action == '[') {
      let subcmd = ary.shift()
      //  入れ替え
      if(subcmd == '_') {
        let left = ary.shift()
        let right = ary.shift()
        let _left = _$(`#area-${left}`)
        let _right = _$(`#area-${right}`)
        Area.swap(_left, _right)
      }
    }
    //  セル系
    if(action == '^') {
      let subcmd = ary.shift()
      //  入れ替え
      if(subcmd == '_') {
        let left = ary.shift() + ary.shift()
        let right = ary.shift() + ary.shift()
        let _left = _$(`#cell-${left}`)
        let _right = _$(`#cell-${right}`)
        Cell.swap(_left, _right)
      }
    }
    History.push(_$("#command").value)
    _$("#command").value = null
    PageData.save(Page.currentId())
  }
}

//  画面表示系。
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
    cell.classList.add("status--with--note")

    let tag = document.createElement("div")
    tag.className = "tag--cell--id"
    let iconNote = document.createElement("div")
    iconNote.className = "icon--cell--note"

    let wrapSubject = document.createElement("div")
    wrapSubject.className = "content--cell--wrap--subject"

    let subject = document.createElement("div")
    subject.className = "content--cell--subject"

    let _subject = document.createElement("textarea")
    _subject.className = "content--cell--_subject _hidden"
    _subject.setAttribute("rows", 1)
    _subject.setAttribute("spellcheck", false)
    _subject.setAttribute("wrap", "off")

    let wrapNote = document.createElement("div")
    wrapNote.className = "content--cell--wrap--note"

    let note = document.createElement("div")
    note.className = "content--cell--note"

    let _note = document.createElement("textarea")
    _note.className = "content--cell--_note _hidden"

    //  Cellの組み立て
    //    Cell            cell cell--common
    //      tag             teg--cell--id
    //      wrapSubject     content--cell--wrap--subject
    //        subject         content--cell--subject
    //        _subject        content--cell--_subject
    //      wrapNote        content--cell--wrap--note
    //        note            content--cell--note
    //        _note           content--cell--_note
    wrapSubject.appendChild(subject)
    wrapSubject.appendChild(_subject)
    wrapNote.appendChild(note)
    wrapNote.appendChild(_note)
    cell.appendChild(tag)
    cell.appendChild(iconNote)
    cell.appendChild(wrapSubject)
    cell.appendChild(wrapNote)

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
    //  セルのクリックは透過させない。透過すると選択できなくなるため。
    _$(".cell").forEach((c) => {
      c.addEventListener("click", (e) => {
        e.stopPropagation()
      })
    })

    //  エリアの中央セルを装飾する
    _$("*[id^=cell][id$=d]").forEach(cell => cell.classList.add("cell--theme"))

    //  ページ枠を作る
    PAGE_ADDRESS.split("").forEach(address => {
      Page.add(address)
    })
    //  ごまかし。ページの入力がtextareaではないため、これでイベントの透過を止める。
    _$(".page").forEach((p) => {
      p.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
    })
    Page.focus(_$(".page")[0])

    //  セルへの入力機能。
    //    表示（div）と入力（textarea）の二重構造。

    _$(".content--cell--wrap--subject").forEach(s => { s.addEventListener("dblclick", (e) => { Cell.focusSubject(e.currentTarget) }) })
    _$(".content--cell--_subject").forEach(s => { s.addEventListener("blur", (e) => { Cell.blurSubject(e.currentTarget) }) })
    _$(".content--cell--_subject").forEach(s => { s.addEventListener("change", (e) => { Cell.changeSubject(e.currentTarget) }) })
    _$(".content--cell--wrap--note").forEach(n => { n.addEventListener("dblclick", (e) => { Cell.focusNote(e.currentTarget) }) })
    _$(".content--cell--_note").forEach(n => { n.addEventListener("blur", (e) => { Cell.blurNote(e.currentTarget) }) })
    _$(".content--cell--_note").forEach(n => { n.addEventListener("change", (e) => { Cell.changeNote(e.currentTarget) }) })

    //- 改行に合わせてテキストエリアのサイズ変更
    _$(".content--cell--_subject").forEach(s => {
      s.addEventListener("input", textareaAdjustment)
      s.addEventListener("focus", textareaAdjustment)
    })

    //  突き抜けてきたクリックイベントは全部コマンドラインへのフォーカスに当てる。
    _$q("body")[0].addEventListener("click", () => {
      _$("#command").focus()
    })
  }

  //  画面上のパネルのサイズを固定させる（＝ピクセルサイズ指定にする）。
  //  これをすることで、セルに文字溢れがあってもセルのサイズが変わらなくなる。
  static fixedPanelSize = () => {
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

  static resizeWindow = () => {
    this.fixedPanelSize()
  }

  //  フルスクリーン表示
  static full = () => {
    _$("#top").classList.add("_hidden")
    _$("#left").classList.add("_hidden")
    _$("#right").classList.add("_hidden")
    this.fixedPanelSize()
  }

  //  通常表示
  static normal = () => {
    _$("#top").classList.remove("_hidden")
    _$("#left").classList.remove("_hidden")
    _$("#right").classList.remove("_hidden")
    this.fixedPanelSize()
  }

  static toggle = () => {
    if(_$("#top").classList.contains("_hidden")) {
      this.normal()
    } else {
      this.full()
    }
  }

  //  現在の表示モードを返す（暫定版）
  static isNormal = () => {
    //  特別なテキストエリアを表示している場合は、ノーマルモードではない。
    if(! _$("#notepad").classList.contains("_hidden")) return false
    if(! _$("#import_export").classList.contains("_hidden")) return false
    //  入力を行っている時は、ノーマルモードではない。
    if(document.activeElement.tagName != "BODY") return false
    return true
  }
}

//  コマンド履歴。
//  上下キーで履歴を参照できる。
//  履歴を呼び出し書き換え実行、した場合、元の履歴は残り、実行分が新しい履歴が追加される。
//  履歴の上限は（ひとまず）20件まで。
//  履歴は保存に残る。
//  履歴キューを復帰させる際は、泥臭く History.queue を上書きすること。
class History {
  //  履歴キュー。0番地は「現在入力中のコマンドを仮保存する領域」。履歴は1番地目以降。
  static queue = [""]
  static max = 20
  static counter = 0

  static push = (command) => {
    this.queue[0] = command
    this.queue.unshift("")
    if(this.max < this.queue.length) this.queue.pop()
    this.counter = 0
  }

  //  「前の一件」を返す。
  //  戻り値：{command:, number:, total:}
  //  返すべき履歴がない場合、{null, null, total} を返す。
  static prev = () => {
    let result = {command: null, number: null, total: this.queue.length}
    //  0番地目から1番地目へ移動する際は、入力途中のコマンドを0番地目に控える。
    if(this.counter == 0) this.queue[0] = _$("#command").value
    if(this.counter + 1 < this.queue.length) {
      this.counter++
      result.command = this.queue[this.counter]
      result.number = this.counter
    }
    return result
  }

  static next = () => {
    let result = {command: null, number: null, total: this.queue.length}
    if(0 < this.counter) {
      this.counter--
      result.command = this.queue[this.counter]
      result.number = this.counter
    }
    return result
  }

  static toJson = () => {
    return JSON.stringify(this.queue)
  }
}

//  Undo
//  一般的なアンドゥ管理。
//  この情報は、保存されない。
//  Undoを適用したい対象（例：PageData）にて、init, push を適時呼ぶこと。
class Undo {
  static queue = []
  static max = 20
  static counter = 0

  static init = (json_str) => {
    this.counter = 0
    this.queue = [json_str]
  }

  static undo = () => {
    let result = null
    if(this.counter + 1 < this.queue.length) {
      this.counter++
      result = this.queue[this.counter]
    }
    return result
  }
  static redo = () => {
    let result = null
    if(0 <= this.counter - 1) {
      this.counter--
      result = this.queue[this.counter]
    }
    return result
  }
  static push = (json_str) => {
    while(this.counter) {
      this.counter--
      this.queue.shift()
    }
    this.queue.unshift(json_str)
    if(this.max < this.queue.length) this.queue.pop()
  }
}

//  ページ
class Page {
  list = []

  //  現在開いているページのID（0-f）を返す
  static currentId = () => {
    return (/.$/.exec(this.current().id)[0])
  }
  //  現在開いているページのDoMを返す
  static current = () => {
    return _$q(".page.current")[0]
  }

  //  指定されたページにフォーカスを当てる
  static focus = (dom) => {
    this.unfocus()
    dom.classList.add("current")
  }
  //  現在指定されているページのカレントを外す
  static unfocus = () => {
    let current = this.current()
    if(current) current.classList.remove("current")
  }

  //  ページDoMを生成し画面に追加する
  static add = (address = "0", title = null) => {
    let page = document.createElement("div")
    page.id = `page_${address}`
    page.className = "page shadow"
    _$("#right").appendChild(page)
    let _address = document.createElement("div")
    _address.className = "page--address"
    _address.innerHTML = `${address}:`
    _address.addEventListener("click", (e) => {
      let id = /.?/.exec((e.currentTarget.innerHTML))[0]
      Page.specify(id)
    })
    page.appendChild(_address)
    let _title = document.createElement("div")
    _title.setAttribute("contenteditable", true)
    _title.className = "page--title"
    _title.innerHTML = title
    page.appendChild(_title)
  }

  //  指定されたページを開く（カレントにする、データ読む、なければ作る）
  static specify = (page_num) => {
    this.focus(_$(`#page_${page_num}`))
    PageData.load(page_num)
    //  セルのカーソル状態をデフォルトに戻す
    Cell.defaultCursor()
  }
}

//  マップ
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

//  エリア
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

  static swap = (left, right) => {
    if(!(left && right)) return false
    let _l = /.$/.exec(left.id)[0]
    let _r = /.$/.exec(right.id)[0]
    ADDRESS.split("").forEach(a => {
      let l_cell = _$(`#cell-${_l}${a}`)
      let r_cell = _$(`#cell-${_r}${a}`)
      Cell.swap(l_cell, r_cell)
    })
    return true
  }
}

//  セル
class Cell {
  static current = () => {
    return _$q(".cell.current")[0]
  }
  static defaultCursor = () => {
    _$q(".current.cell").forEach((e) => e.classList.remove("current"))
    Cell.focus(_$("#cell-dd"))
  }
  static focus = (dom) => {
    this.unfocus()
    dom.classList.add("current")
  }
  static unfocus = () => {
    let current = this.current()
    if(current) current.classList.remove("current")
  }

  static swap = (l_dom, r_dom) => {
    if(!(l_dom && r_dom)) return false
    //  要素を持つ
    let leftSubject = _$(".content--cell--subject", l_dom)[0]
    let leftSubjectData = _$(".content--cell--_subject", l_dom)[0]
    let rightSubject = _$(".content--cell--subject", r_dom)[0]
    let rightSubjectData = _$(".content--cell--_subject", r_dom)[0]
    let leftNote = _$(".content--cell--note", l_dom)[0]
    let leftNoteData = _$(".content--cell--_note", l_dom)[0]
    let rightNote = _$(".content--cell--note", r_dom)[0]
    let rightNoteData = _$(".content--cell--_note", r_dom)[0]

    //  値を交換
    let _SubjectData = leftSubjectData.value
    let _NoteData = leftNoteData.value
    leftSubjectData.value = rightSubjectData.value
    leftNoteData.value = rightNoteData.value
    rightSubjectData.value = _SubjectData
    rightNoteData.value = _NoteData

    //  表示更新
    Cell.refresh(l_dom)
    Cell.refresh(r_dom)
    return true
  }

  //  表示更新
  static refresh = (dom) => {
    let subject = _$(".content--cell--subject", dom)[0]
    let _subject = _$(".content--cell--_subject", dom)[0]
    let note = _$(".content--cell--note", dom)[0]
    let _note = _$(".content--cell--_note", dom)[0]
    subject.innerHTML = _subject.value
    note.innerHTML = _note.value
    //  アイコン表示状態の更新
    if(_note.value) {
      dom.classList.add("status--with--note")
    } else {
      dom.classList.remove("status--with--note")
    }
  }

  static focusSubject = (dom) => {
    let wrap = dom
    let subject = _$(".content--cell--subject", wrap)[0]
    let _subject = _$(".content--cell--_subject", wrap)[0]
    subject.classList.add("_hidden")
    _subject.classList.remove("_hidden")
    _subject.focus()
    wrap.classList.add("status--overwrite")
  }
  static blurSubject = (dom) => {
    let _subject = dom
    let subject = _$(".content--cell--subject", _subject.parentNode)[0]
    subject.innerHTML = _subject.value
    subject.classList.remove("_hidden")
    _subject.classList.add("_hidden")
    Cell.refresh(subject.closest(".cell"))
    _subject.closest(".content--cell--wrap--subject").classList.remove("status--overwrite")
  }
  static changeSubject = (dom) => {
    PageData.save(Page.currentId())
  }
  static focusNote = (dom) => {
    let wrap = dom
    let note = _$(".content--cell--note", wrap)[0]
    let _note = _$(".content--cell--_note", wrap)[0]
    note.classList.add("_hidden")
    _note.classList.remove("_hidden")
    _note.focus()
    wrap.classList.add("status--overwrite")
  }
  static blurNote = (dom) => {
    let _note = dom
    let note = _$(".content--cell--note", _note.parentNode)[0]
    note.innerHTML = _note.value
    note.classList.remove("_hidden")
    _note.classList.add("_hidden")
    Cell.refresh(note.closest(".cell"))
    _note.closest(".content--cell--wrap--note").classList.remove("status--overwrite")
  }
  static changeNote = (dom) => {
    PageData.save(Page.currentId())
  }
}

//  セルのIDタグ管理（画面初期化／表示／非表示）。
class CellIdTag {
  static init = () => {
    _$(".tag--cell--id").forEach( t => {
      let value = /..$/.exec(t.parentNode.id)[0]
      t.innerHTML = value
      if((MasterData.data.cell_id_tag_enable || false) == false) t.classList.add("_hidden")
    })
  }
  static enable = () => {
    _$(".tag--cell--id").forEach(t => t.classList.remove("_hidden"))
    MasterData.data.cell_id_tag_enable = true
    MasterData.save()
  }
  static disable = () => {
    _$(".tag--cell--id").forEach(t => t.classList.add("_hidden"))
    MasterData.data.cell_id_tag_enable = false
    MasterData.save()
  }
  static toggle = () => {
    _$(".tag--cell--id").forEach(t => t.classList.toggle("_hidden"))
    MasterData.data.cell_id_tag_enable = !(MasterData.data.cell_id_tag_enable)
    MasterData.save()
  }
}


//  初期化関数。
function init() {
  //  画面上に枠だけ作る
  Display.init()
  Display.fixedPanelSize()
  window.addEventListener("resize", Display.resizeWindow)

  //  これは余計な処理
  _$(".cell").forEach(cell => cell.addEventListener("click", cell_action))

  //  データ読み込み。ここで「主データ」をまずは読み、次に現在ページを読むようにする。
  if(! MasterData.load()) MasterData.init()
  let currentPage = MasterData.data.currentPage || 0
  Page.specify(currentPage)

  //  セルタグの値を設定する
  CellIdTag.init()

  //  コマンド枠を初期化する。
  Command.init()
  command.focus()
}
window.onload = init;

//  その他、整理ついていないもの。  {

//  セルクリック時の処理。あとでいい。
function cell_action(e) {
//    e.currentTarget.classList.toggle("cell--theme")
//    PageData.save()
//  _$("#notepad").classList.remove("_hidden")
}


function textareaAdjustment(e) {
  // textarea要素のpaddingのY軸(高さ)
  const PADDING_Y = 0
  let t = e.currentTarget
  // textareaそ要素のlineheight
  let lineHeight = getComputedStyle(t).lineHeight
  // "19.6px" のようなピクセル値が返ってくるので、数字だけにする
  lineHeight = lineHeight.replace(/[^-\d\.]/g, '')
  lineHeight = 20
  // textarea要素に入力された値の行数
  const lines = (t.value + '\n').match(/\n/g).length
  // 高さを再計算
  t.style.height = lineHeight * lines + PADDING_Y + 'px'
}

//  }
