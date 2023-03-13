//  定数系  {
const ADDRESS = "wersdfzxc"
const PAGE_ADDRESS = "0123456789abcdef"
const STORAGE_NAME = "mandala"
const DEFAULT_BOOK_NAME = "20230302"
const URL_PARAMS = urlParams()
const BOOK_ID = URL_PARAMS["book"]
const READONLY = document.getElementById("app_status").dataset.mode == "readonly"
function urlParams(url = location.href) {
  let params = url.split("?")[1] || ""
  let array = params.split("&")
  let result = {}
  array.forEach((p) => {
    let kv = p.split("=")
    if(kv[0]) result[kv[0]] = kv[1] || ""
  })
  return result
}
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


//  非同期版のブックデータ管理
class BookData {
  //  メモリ上のブックデータ
  static data = null
  static is_synchronizing = false

  //  非同期読み込み。
  //  読み込み、結果をメモリに反映する。
  //  処理中、「同期中フラグ」を立てる。
  static load = (bookId = Book.bookId, callback) => {
    //  すでに同期中だったら、例外を投げる。
    if(this.is_synchronizing) throw new Error("Already sync now.");
    //  同期が開始したら、同期中フラグを立てる。
    this.is_synchronizing = true
    //  APIからデータを読み込む。
    axios.get(`/api/v1/book/${bookId}`)
    .then((data) => {
      this.data = JSON.parse(data.data)
      this.is_synchronizing = false
      callback()
    })
    .catch(() => {
      //  データがなければ初期データを作成し保存する。
      this.init(bookId)
      this.is_synchronizing = false
      callback()
    })
  }

  //  なければ初期化／保存する。
  static init = (bookId = Book.bookId) => {
    let json = {}
    json.title = "__blank__"
    json.pages = []
    PAGE_ADDRESS.split("").forEach(a => {
      json.pages.push("")
    })
    json.currentPage = 0
    this.data = json
    this.save(bookId)
  }

  //  非同期書き込み。
  //  呼び出しっぱなしでOK。
  static save = (bookId = Book.bookId, proc = null) => {
    if (READONLY) return
    let json = {}
    json.text = JSON.stringify(this.data)
    //  UPDATE でNGだったら INSERT .
    //  →いや、ユースケース的にアプリ中にBookを追加することはないはず。後で外そう。
    axios.put(`/api/v1/book/${bookId}`, json)
    .then(() => {
    })
    .catch(() => {
      axios.post(`/api/v1/book/${bookId}`, json)
    })
  }

  //  メモリ上のブックデータをアプリに反映する。
  static apply = () => {
    _$("#book_title").innerHTML = this.data.title
    this.data.pages.forEach((page, index) => {
      _$("#right").children[index].children[1].innerHTML = page
    })
  }
}

//  ページデータの保存／読み出し機能。
class PageData {
  static data = null
  static is_synchronizing = false

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

      _$(".content--cell--subject--sticker", cell)[0].innerHTML = note.stickerSubject || ""
      _$(".content--cell--note--sticker", cell)[0].innerHTML = note.stickerNote || ""
    })

    //  ステッカーにアクションを設定する
    if(! READONLY) {
      _$(".sticker").forEach(s => { Sticker.setActions(s) })
    }

    BookData.apply()
    //  セルの表示更新
    _$(".cell").forEach(e => { Cell.refresh(e) })
  }

  //  ストレージからの単純な読み取りだけ。
  static read = (pageId, bookId = Book.bookId, proc) => {
    //  すでに同期中だったら、例外を投げる。
    if(this.is_synchronizing) throw new Error("Already syncc now.");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${bookId}/page/${pageId}`)
    .then((data) => {
      this.data = JSON.parse(data.data)
      this.apply(this.data)
      this.is_synchronizing = false
      proc()
    })
    .catch((data) => {
      this.data = this.jsonFormat()
      this.apply(this.data)
      if(! READONLY) {
        let payload = {text: JSON.stringify(this.data)}
        let result = axios.post(`/api/v1/book/${bookId}/page/${pageId}`, payload)
      }
      this.is_synchronizing = false
    })
  }

  //  データの読み取り＆アプリへの適用をセットで行う。
  static load = (pageId, bookId = Book.bookId) => {
    PageData.read(pageId, bookId, () => {
      this.apply(this.data)
      //  アンドゥ履歴に現状を初期値として設定。
      Undo.init(JSON.stringify(PageData.data))
    })
    return true
  }

  //  ストレージへの書き込み。
  static write = (json, pageId, bookId) => {
    if (READONLY) return
    let payload = {text: JSON.stringify(json)}
    axios.put(`/api/v1/book/${bookId}/page/${pageId}`, payload)
    .catch(() => {
      axios.post(`/api/v1/book/${bookId}/page/${pageId}`, payload)
    })
    Undo.push(JSON.stringify(json))
  }

  //  アプリ情報を保存する。
  static save = (pageId, bookId = Book.bookId) => {
    let json = this.#toJson()
    PageData.write(json, pageId, bookId)
  }

  static #toJson = () => {
    let notes = []
    let page = {"title": "Sample", "notes": notes}
    _$q(".map .cell").forEach( cell => {
      notes.push({
        "id": cell.id, 
        "showName": _$(".content--cell--_subject", cell)[0].value || "",
        "class": cell.classList.value || "",
        "text": _$(".content--cell--_note", cell)[0].value || "",
        "stickerSubject": _$(".content--cell--subject--sticker", cell)[0].innerHTML || "",
        "stickerNote": _$(".content--cell--note--sticker", cell)[0].innerHTML || ""
      })
    })
    return page
  }
}

//  ブック
class Book {
  static bookId = ""
  static init = () => {
    this.bookId = URL_PARAMS["book"] || ""
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
    page.addEventListener("dblclick", (e) => {
      let id = /.?/.exec((_$(".page--address", e.currentTarget)[0].innerHTML))[0]
      Page.specify(id)
      BookData.data.currentPage = id
      //  TODO: ここでsaveすると、なぜかBookData.dataの内容が巻き戻る形でDBに保存される。ひとまず保存をやめる。
      //  BookData.save()
    })
    page.appendChild(_address)
    let _title = document.createElement("div")
    _title.setAttribute("contenteditable", true)
    _title.className = "page--title"
    _title.innerHTML = title
    _title.addEventListener("blur", (e) => {
      let page = e.currentTarget.closest(".page").id.match(/.$/)
      BookData.data.pages[parseInt(page, 16)] = e.currentTarget.innerHTML
      BookData.save()
    })
    page.appendChild(_title)
  }

  //  指定されたページを開く（カレントにする、データ読む、なければ作る）
  static specify = (page_num) => {
    this.focus(_$(`#page_${page_num}`))
    PageData.load(page_num, Book.bookId, () => {
      //  セルのカーソル状態をデフォルトに戻す
      Cell.defaultCursor()
    })
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

  static clear = (dom) => {
    let subjectData = _$(".content--cell--_subject", dom)[0]
    let noteData = _$(".content--cell--_note", dom)[0]
    subjectData.value = null
    noteData.value = null
    Cell.refresh(dom)
  }

  static copy = (f_dom, t_dom) => {
    if(!(f_dom && t_dom)) return false
    //  要素を持つ
    let fromSubjectData = _$(".content--cell--_subject", f_dom)[0]
    let toSubjectData = _$(".content--cell--_subject", t_dom)[0]
    let fromNoteData = _$(".content--cell--_note", f_dom)[0]
    let toNoteData = _$(".content--cell--_note", t_dom)[0]

    //  値を交換
    toSubjectData.value = fromSubjectData.value
    toNoteData.value = fromNoteData.value

    //  表示更新
    Cell.refresh(t_dom)
    return true
  }

  static swap = (l_dom, r_dom) => {
    if(!(l_dom && r_dom)) return false
    //  要素を持つ
    let leftSubjectData = _$(".content--cell--_subject", l_dom)[0]
    let rightSubjectData = _$(".content--cell--_subject", r_dom)[0]
    let leftNoteData = _$(".content--cell--_note", l_dom)[0]
    let rightNoteData = _$(".content--cell--_note", r_dom)[0]

    //  値を交換
    let _SubjectData = leftSubjectData.value
    let _NoteData = leftNoteData.value
    leftSubjectData.value = rightSubjectData.value
    leftNoteData.value = rightNoteData.value
    rightSubjectData.value = _SubjectData
    rightNoteData.value = _NoteData

    //  ステッカー分
    let leftSubjectSticker = _$(".content--cell--subject--sticker", l_dom)[0]
    let rightSubjectSticker = _$(".content--cell--subject--sticker", r_dom)[0]
    let leftNoteSticker = _$(".content--cell--note--sticker", l_dom)[0]
    let rightNoteSticker = _$(".content--cell--note--sticker", r_dom)[0]

    let _sticker = null
    _sticker = leftSubjectSticker.innerHTML
    leftSubjectSticker.innerHTML = rightSubjectSticker.innerHTML
    rightSubjectSticker.innerHTML = _sticker
    _sticker = leftNoteSticker.innerHTML
    leftNoteSticker.innerHTML = rightNoteSticker.innerHTML
    rightNoteSticker.innerHTML = _sticker

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
      if((BookData.data.cell_id_tag_enable || false) == false) t.classList.add("_hidden")
    })
  }
  static enable = () => {
    _$(".tag--cell--id").forEach(t => t.classList.remove("_hidden"))
    BookData.data.cell_id_tag_enable = true
    BookData.save()
  }
  static disable = () => {
    _$(".tag--cell--id").forEach(t => t.classList.add("_hidden"))
    BookData.data.cell_id_tag_enable = false
    BookData.save()
  }
  static toggle = () => {
    _$(".tag--cell--id").forEach(t => t.classList.toggle("_hidden"))
    BookData.data.cell_id_tag_enable = !(BookData.data.cell_id_tag_enable)
    BookData.save()
  }
}

//  コマンド処理。
//  コマンドライン系と
//  ホットキー系の両方をまとめて書いている。
class Command {
  static init = () => {
    //  ホットキーの設定
    this.#initHotKey()
    //  コマンド枠の設定
    this.#initCommandLine()
  }

  //  単発キー（＝ホットキー）系の実装
  static #initHotKey = () => {
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
          let strings = JSON.stringify(PageData.read(BookData.data.currentPage), null, "  ")
          _$("#import_export").value = strings
        } else {
          let json
          try {
            json = JSON.parse(_$("#import_export").value)
            _$("#import_export").classList.add("_hidden")
            PageData.write(json, BookData.data.currentPage, Book.bookId)
            PageData.load(Page.currentId())
            BookData.apply()
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
      //  セルビューの表示トグル
      if(code == "KeyC" && onCtrl) {
        Detail.toggle(_$("#map_detail"))
        return
      }
      //  テスト用
      if(code == "KeyR" && onCtrl) {
        console.log(BookData.data)
        return
      }
      //  ステッカー操作
      //  拡大
      if(code == "Period") {
        if(Sticker.currentSticker) {
          let h = Sticker.currentSticker.style.height || "20%"
          h = parseInt(h) + 5
          Sticker.currentSticker.style.height = h + "%"
        }
      }
      //  縮小
      if(code == "Comma") {
        if(Sticker.currentSticker) {
          let h = Sticker.currentSticker.style.height || "20%"
          h = parseInt(h) - 5
          if(h < 10) h = 10
          Sticker.currentSticker.style.height = h + "%"
        }
      }
      //  左回転
      if(code == "KeyK") {
        if(Sticker.currentSticker) {
          let img = _$q("img", Sticker.currentSticker)[0]
          let h = img.style.transform || "rotate(0deg)"
          h = (parseInt(h.match(/-?[0-9]+/)[0]) - 10) % 360
          img.style.transform = `rotate(${h}deg)`
        }
      }
      //  右回転
      if(code == "KeyL") {
        if(Sticker.currentSticker) {
          let img = _$q("img", Sticker.currentSticker)[0]
          let h = img.style.transform || "rotate(0deg)"
          h = (parseInt(h.match(/-?[0-9]+/)[0]) + 10) % 360
          img.style.transform = `rotate(${h}deg)`
        }
      }
      //  削除
      if(code == "Backspace") {
        if(Sticker.currentSticker) { Sticker.currentSticker.remove() }
      }
      //  一括表示／非表示
      if(code == "KeyN" && onCtrl) {
        if(Sticker.isShow) {
          _$(".sticker").forEach((s) => {s.classList.add("_hidden")})
          Sticker.isShow = false
        } else {
          _$(".sticker").forEach((s) => {s.classList.remove("_hidden")})
          Sticker.isShow = true
        }
      }
    })
  }

  //  コマンド枠の設定
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
            BookData.data.currentPage = subcmd
            BookData.save()
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

  //  コマンドの解釈と実行
  static exec = (line) => {
    let is_correct = false
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
        is_correct = true
      }
    }
    //  長ものコマンド
    if(action == ':') {
      let command = ary.join('')
      let tmp
      if("clear" == command) {
        _$(".content--cell--subject").forEach(c => c.innerHTML = null)
        is_correct = true
      }
    }
    //  ページ系
    if(action == '/') {
      let subcmd = ary.shift()
      //  リネーム
      if(subcmd == '/') {
        let page = ary.shift()
        if(PAGE_ADDRESS.includes(page)) {
          BookData.data.pages[parseInt(page, 16)] = ary.join("")
          BookData.save()
          BookData.apply()
          is_correct = true
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
          let leftName = BookData.data.pages[_left]
          let rightName = BookData.data.pages[_right]
          BookData.data.pages[_right] = leftName
          BookData.data.pages[_left] = rightName
          BookData.save()
//          PageData.write(leftPage, `${STORAGE_NAME}_${right}`)
//          PageData.write(rightPage, `${STORAGE_NAME}_${left}`)
          PageData.load(Page.currentId())
          BookData.apply()
          is_correct = true
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
          let leftName = BookData.data.pages[_left]
          let rightName = BookData.data.pages[_right]
          BookData.data.pages[_right] = leftName
          BookData.save()
//          PageData.write(leftPage, `${STORAGE_NAME}_${right}`)
          PageData.load(Page.currentId())
          BookData.apply()
          is_correct = true
        }
      }
      //  初期化
      if(subcmd == '-') {
        ary.forEach(p => {
          if(PAGE_ADDRESS.includes(p)) {
//            PageData.write(PageData.jsonFormat(), `${STORAGE_NAME}_${p}`)
            BookData.data.pages[parseInt(p, 16)] = ""
            BookData.save()
            PageData.load(Page.currentId())
            BookData.apply()
            is_correct = true
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
        is_correct = Area.swap(_left, _right)
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
        is_correct = Cell.swap(_left, _right)
      }
    }
    //  セルビュー（左）
    //  コマンド履歴／アンドゥには入れない。
    if(action == '<') {
      let view_left = _$("#map_detail_left")
      let view = _$("#map_detail")
      let keeper = _$("#map_detail_left_keeper")
      if(ary[0] == '-') {
        Detail.backto(view_left, keeper)
      } else {
        let cell_id = ary.shift() + ary.shift()
        let cell = _$(`#cell-${cell_id}`)
        if(cell) {
          Detail.show()
          Detail.pickup(view_left, keeper, cell)
        }
      }
    }
    //  セルビュー（右）
    //  コマンド履歴／アンドゥには入れない。
    if(action == '>') {
      let view_right = _$("#map_detail_right")
      let view = _$("#map_detail")
      let keeper = _$("#map_detail_right_keeper")
      if(ary[0] == '-') {
        Detail.backto(view_right, keeper)
      } else {
        let cell_id = ary.shift() + ary.shift()
        let cell = _$(`#cell-${cell_id}`)
        if(cell) {
          Detail.show()
          Detail.pickup(view_right, keeper, cell)
        }
      }
    }
    //  ステッカー系
    if(action == 'k') {
      let cellId = ary.shift() + ary.shift()
      let cell = _$(`#cell-${cellId}`)
      if(cell) {
        let noteSticker = _$(".content--cell--note--sticker", cell)[0]
        Sticker.add(noteSticker, ary.join(""))
        is_correct = true
      }
    }
    if(action == 'K') {
      let cellId = ary.shift() + ary.shift()
      let cell = _$(`#cell-${cellId}`)
      if(cell) {
        let subjectSticker = _$(".content--cell--subject--sticker", cell)[0]
        Sticker.add(subjectSticker, ary.join(""))
        is_correct = true
      }
    }
    //  コマンドが正常に処理されたら、保存＆履歴＆Undoに入れる。
    if(is_correct) {
      PageData.save(Page.currentId())
      History.push(_$("#command").value)
      _$("#command").value = null
    }
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

    let subjectSticker = document.createElement("div")
    subjectSticker.className = "content--cell--subject--sticker"

    let subject = document.createElement("div")
    subject.className = "content--cell--subject"

    let _subject = document.createElement("textarea")
    _subject.className = "content--cell--_subject _hidden"
    _subject.setAttribute("rows", 1)
    _subject.setAttribute("spellcheck", false)
    _subject.setAttribute("wrap", "off")

    let wrapNote = document.createElement("div")
    wrapNote.className = "content--cell--wrap--note"

    let noteSticker = document.createElement("div")
    noteSticker.className = "content--cell--note--sticker"

    let note = document.createElement("div")
    note.className = "content--cell--note"

    let _note = document.createElement("textarea")
    _note.className = "content--cell--_note _hidden"

    //  Cellの組み立て
    //    Cell            cell cell--common
    //      tag             teg--cell--id
    //      wrapSubject     content--cell--wrap--subject
    //        subjectSticker  content--cell--subject--sticker
    //        subject         content--cell--subject
    //        _subject        content--cell--_subject
    //      wrapNote        content--cell--wrap--note
    //        noteSticker     content--cell--note--sticker
    //        note            content--cell--note
    //        _note           content--cell--_note
    wrapSubject.appendChild(subjectSticker)
    wrapSubject.appendChild(subject)
    wrapSubject.appendChild(_subject)
    wrapNote.appendChild(noteSticker)
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
    "wersfzxc".split("").forEach((c) => {_$(`#cell-${c}d`).classList.add("cell--silver")})
    _$("#cell-dd").classList.add("cell--gold")

    //  ページ枠を作る
    _$("#right").innerHTML = "ページリスト"
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
    //    wrap をダブルクリックされたら _subject を表示し、wrap のクリック操作を一時受け付けなくする。
    //    _subject のフォーカスが外れたら、subject を表示し、wrap のクリック操作を受け付けるように戻す。
    if(READONLY == false) {
      _$(".content--cell--wrap--subject").forEach(s => { s.addEventListener("dblclick", (e) => {
        Cell.focusSubject(e.currentTarget)
        let w = e.currentTarget
        w.style.pointerEvents = "none"
        }) })
      _$(".content--cell--_subject").forEach(s => { s.addEventListener("blur", (e) => {
        Cell.blurSubject(e.currentTarget)
        e.currentTarget.closest(".content--cell--wrap--subject").style.pointerEvents = "initial"
        }) })
      _$(".content--cell--_subject").forEach(s => { s.addEventListener("change", (e) => {
        Cell.changeSubject(e.currentTarget)
        }) })
      _$(".content--cell--_subject").forEach(s => { s.addEventListener("dblclick", (e) => {
          e.currentTarget.blur()
          e.stopPropagation()
        }) })

      //  ノートのクリック処理。 セルと同じ。
      _$(".content--cell--wrap--note").forEach(n => { n.addEventListener("dblclick", (e) => {
        Cell.focusNote(e.currentTarget)
        e.currentTarget.style.pointerEvents = "none"
        }) })
      _$(".content--cell--_note").forEach(n => { n.addEventListener("blur", (e) => {
        Cell.blurNote(e.currentTarget)
        e.currentTarget.closest(".content--cell--wrap--note").style.pointerEvents = "initial"
        }) })
      _$(".content--cell--_note").forEach(s => { s.addEventListener("change", (e) => {
        Cell.changeNote(e.currentTarget)
        }) })
      _$(".content--cell--_note").forEach(s => { s.addEventListener("dblclick", (e) => {
          e.currentTarget.blur()
          e.stopPropagation()
        }) })
    }

    //- 改行に合わせてテキストエリアのサイズ変更
    _$(".content--cell--_subject").forEach(s => {
      s.addEventListener("input", textareaAdjustment)
      s.addEventListener("focus", textareaAdjustment)
    })

    //  突き抜けてきたクリックイベントは全部コマンドラインへのフォーカスに当てる。
    _$q("body")[0].addEventListener("click", (e) => {
      _$("#command").focus()
    })
    //  トップ（＝ブックタイトル）のクリックは、突き抜けさせない。
    _$("#top").addEventListener("click", (e) => {
      e.stopPropagation()
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
    //  セルビュー（浮いているdiv）のサイズ設定
    let detail = _$("#map_detail")
    let center = _$("#center")
    let rect = center.getBoundingClientRect(center)
    let styles = ["offsetLeft", "offsetTop", "width", "height"]
    styles.forEach(s => {
      detail.style[s] = `${rect[s]}px`
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


//  その他、整理ついていないもの。  {

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

class Detail {
  //  指定したパネル（左or右）を対象に、持っているセルをマップに戻す。
  static backto(map_detail_panel, keeper) {
    //  セルをマップに戻す
    let cell = Detail.cell(map_detail_panel)
    if(cell) {
      keeper.after(cell)
      map_detail_panel.appendChild(keeper)
      map_detail_panel.classList.add("_hidden")
    } else {
      //  セルがもう戻されている状態でさらにbacktoがコールされたら、keeperを解除する意図と解釈する。
      keeper.cell = null
    }
  }
  //  指定したパネル（左or右）に、指定したセルを移動させる。
  //  パネルが既にセルを持っている場合は、一度戻してから実行する。
  static pickup(map_detail_panel, keeper, cell) {
    //  応急処置。パネルに既に載っているセルが指定された場合、なにもしない。
    //  （本当は可能にしたい。設計が上手くできていないので、あとで直す）
    if(cell.closest("#map_detail")) return
    Detail.backto(map_detail_panel, keeper)
    cell.after(keeper)
    map_detail_panel.appendChild(cell)
    map_detail_panel.classList.remove("_hidden")
  }
  //  指定したパネルが持っているセルを返す。ない場合はnull。
  static cell(map_detail_panel) {
    return _$(".cell", map_detail_panel)[0] || null
  }

  //  セル詳細を隠す。
  //  隠す際、keeperに「参照していたセルの情報」を残す。
  static hidden = (map_detail = _$("#map_detail")) => {
    if(map_detail.classList.contains("_hidden")) return
    let left_panel = _$("#map_detail_left")
    let left_cell = Detail.cell(left_panel)
    let left_keeper = _$("#map_detail_left_keeper")
    let right_panel = _$("#map_detail_right")
    let right_cell = Detail.cell(right_panel)
    let right_keeper = _$("#map_detail_right_keeper")
    if(left_cell) {
      Detail.backto(left_panel, left_keeper)
      left_keeper.cell = left_cell
    }
    if(right_cell) {
      Detail.backto(right_panel, right_keeper)
      right_keeper.cell = right_cell
    }
    map_detail.classList.add("_hidden")
  }

  static show = (map_detail = _$("#map_detail")) => {
    if(! map_detail.classList.contains("_hidden")) return
    let left_panel = _$("#map_detail_left")
    let left_keeper = _$("#map_detail_left_keeper")
    let left_cell = left_keeper.cell
    let right_panel = _$("#map_detail_right")
    let right_keeper = _$("#map_detail_right_keeper")
    let right_cell = right_keeper.cell
    if(left_cell) {
      Detail.pickup(left_panel, left_keeper, left_cell)
      left_keeper.cell = null
    }
    if(right_cell) {
      Detail.pickup(right_panel, right_keeper, right_cell)
      right_keeper.cell = null
    }
    map_detail.classList.remove("_hidden")
  }

  static toggle = (map_detail = _$("#map_detail")) => {
    if(map_detail.classList.contains("_hidden")) {
      Detail.show(map_detail)
    } else {
      Detail.hidden(map_detail)
    }
  }

  static isShow = (map_detail = _$("#map_detail")) => {
    return ! map_detail.classList.contains("_hidden")
  }
}

////////////////////////////////////////////////////////////////////////////////

//  初期化関数。
//  ブックデータを読み込んだ後に実行。
function init() {
  //  画面上に枠だけ作る
  Display.init()
  Display.fixedPanelSize()
  window.addEventListener("resize", Display.resizeWindow)

  //  ブックの初期化
  Book.init()
  Book.bookId = BOOK_ID

  //  セルタグの値を設定する
  CellIdTag.init()

  //  コマンド枠を初期化する。
  Command.init()
  command.focus()

  //  ページを開く。URLで指定されていたら、最初のページはそれ。
  let openPage = URL_PARAMS["open"] || BookData.data.currentPage || 0
  if(! PAGE_ADDRESS.includes(openPage)) openPage = 0 
  Page.specify(openPage)

  //  ブックデータを画面に反映。
  BookData.apply()

  //  ブックタイトルを保存。
  _$("#book_title").setAttribute("contenteditable", true)
  _$("#book_title").addEventListener("blur", (e) => {
    BookData.data.title = e.currentTarget.innerHTML
    BookData.save()
  })

  //  ログアウト機能
  _$("#logout").addEventListener("click", (e) => {
    axios.delete(`/users/sign_out`)
    .then(() => {
      location.reload()
    })
  })

  //  ReadOnlyモードだったら、各Elmのイベント処理を上書き。
  if(_$("#app_status").dataset.mode == "readonly") {
    ReadOnly.apply()
  }
}

//  処理の始まり。
//  最初にブックデータを読み込むところから始まる。
//  その後、通常のinit処理を実行。
window.onload = () => {BookData.load(BOOK_ID, init)};


//  リードオンリーモードの設定。
//  リードオンリー時は「ダブルクリックで掘り、Spaceで戻る」しかできない。
class ReadOnly {
  static apply = () => {
    //  コマンドは入力不可にする。
    _$("#command").setAttribute("disabled", true)
    //  divの更新設定を外す。
    _$q("[contenteditable=true]").forEach((c) => {
      c.setAttribute("contenteditable", false)
    })
    //  セルのクリック処理。
    //  大マップなら小マップに、小マップならセル拡大に移行する。
    _$(".cell").forEach((c) => {
      c.addEventListener("dblclick", (e) => {
        if(Map.current().id == "map_large") {
          let area_id = /(.).$/.exec(e.currentTarget.id)[1]
          _$("#command").value = `q${area_id}`
          _$("#command").dispatchEvent(new Event("input"))
        } else {
          let cell_id = /..$/.exec(e.currentTarget.id)[0]
          Command.exec(`<${cell_id}`)
        }
      })
    })
    //  ReadOnly専用のホットキーを設定
    this.#hotKey()
  }
  static #hotKey = () => {
    window.addEventListener("keydown", (e) => {
      const keycode = e.keyCode;
      const code  = e.code;
      const onShift = e.shiftKey;
      const onCtrl  = e.ctrlKey;
      const onAlt   = e.altKey;
      const onMeta  = e.metaKey;

      //  セル拡大なら小マップに、小マップなら大マップに移行する。
      if(code == "Space" || code == "Escape") {
        if(Detail.isShow()) {
          Detail.hidden(_$("#map_detail"))
        } else {
          _$("#command").value = "qq"
          _$("#command").dispatchEvent(new Event("input"))
        }
      }
    })
  }
}

class Sticker {
  static currentSticker = null
  static isShow = true
  //  ステッカーを貼る
  static add(div, src) {
    let img = document.createElement('img')
    //  リソースの読み込みに成功した場合のみ、ステッカーを作成
    img.onload = () => {
      let sticker = document.createElement('div')
      sticker.classList.add("sticker")
      img.setAttribute("draggable", false)
      sticker.appendChild(img)
      div.appendChild(sticker)
      Sticker.setActions(sticker)
    }
    img.setAttribute("src", src)
  }
  static setActions = (sticker) => {
    sticker.addEventListener("mousedown", (e) => {
      Sticker.currentSticker = e.currentTarget
    })
    sticker.addEventListener("mouseup", (e) => {
      Sticker.currentSticker = null
    })
    sticker.addEventListener("mouseleave", (e) => {
      Sticker.currentSticker = null
    })
    sticker.addEventListener("mousemove", (e) => {
      if(e.buttons) {
        let ct = e.currentTarget
        let rc = ct.getBoundingClientRect()
        let p = ct.closest(".content--cell--subject--sticker") || ct.closest(".content--cell--note--sticker")
        let rp = p.getBoundingClientRect()
        let i = _$q("img", ct)[0]
        let ri = i.getBoundingClientRect()

        let altt = e.clientY - rp.top - (ri.height / 2)
        let altl = e.clientX - rp.left - (ri.width / 2)

        //  最後にパーセンテージ表記にする
        ct.style.top = `${(altt / rp.height) * 100}%`
        ct.style.left = `${(altl / rp.width) * 100}%`
      }
    })
  }
}

