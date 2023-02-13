const ADDRESS = "wersdfzxc"

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
let _$tag = (selector, from = document) => [...from.querySelectorAll(selector)]


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

  static load = () => {
    let pages = JSON.parse(localStorage.getItem("mandala"))
    if(! pages) return false
    pages.forEach(page => {
      page.notes.forEach(note => {
        let cell = _$id(note.id)
        if(! cell) return
        _$(".content--cell--subject", cell)[0].innerHTML = note.showName || ""
        if(note.class) {
          note.class.split(/ +/).forEach(cls => cell.classList.add(cls))
        }
        _$(".content--cell--note", cell)[0].innerHTML = note.text || ""
      })
    })
    return true
  }

  static save = () => {
    let data = this.#to_json()
    let json = JSON.stringify(data)
    localStorage.setItem("mandala", json)
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
      if(line.length == 2) {
        let cell = _$(`#cell-${line}`)
        if(cell) {
          // cell.classList.toggle("cell--theme")
          e.currentTarget.value = null
          _$("#content--notepad--textarea").value = _$(".content--cell--note", cell)[0].innerHTML
          _$("#notepad").classList.remove("_hidden")
          _$("#content--notepad--textarea").focus()
          _$(".cell--current").forEach(c => c.classList.remove("cell--current"))
          cell.classList.add("cell--current")
        }
      } else {
        if(line.length == 1) {
          if(line == "t") {
            _$(".tag--cell--id").forEach(t => t.classList.toggle("_hidden"))
            e.currentTarget.value = null
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
          let cell = _$(".cell--current")[0]
          _$(".content--cell--note", cell)[0].innerHTML = _$("#content--notepad--textarea").value
          Data.save()
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
          Command.exec(command.value)
          command.value = null
          e.preventDefault()
        }
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
      if("clear" == ary.join('')) {
        _$(".content--cell--subject").forEach(c => c.innerHTML = null)
      }
    }
    _$("#command").value = null
    Data.save()
  }
}

class Display {
  //  お決まりのDOM一式を生成する。
  static init = () => {
    let center = _$("#center")

    //  エリアのひな形を作成
    let area = document.createElement("div")
    area.className = "area"

    //  セルのひな形を作成
    let cell = document.createElement("div")
    cell.className = "cell cell--common shadow"
    let tag = document.createElement("div")
    tag.className = "tag--cell--id"
    cell.appendChild(tag)
    let text = document.createElement("div")
    text.className = "content--cell--note _hidden"
    cell.appendChild(text)
    let content = document.createElement("div")
    content.className = "content--cell--subject"
    cell.appendChild(content)

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
      center.appendChild(a)
    }

    //  セルタグの値を設定する
    _$(".tag--cell--id").forEach( t => {
      let value = /..$/.exec(t.parentNode.id)[0]
      t.innerHTML = value
      }
    )
  }

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
}

function cell_action(e) {
//    e.currentTarget.classList.toggle("cell--theme")
//    Data.save()
  _$("#notepad").classList.remove("_hidden")
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

//  ページ
class Page {
  constructor(json = {"title": "", "cells": []}) {
    this.dom = _$("#center")
    this.dom.instance = this
    cells.forEach(cell => {
      new Cell(cell.id, cell)
    })
    _$(".area").forEach(area => {
      let _area = new Area()
    })
  }
  to_json = () => { }
  fresh = () => { }
}

//  3 * 3 のエリア
class Area {
  constructor(dom_id, json = {}) {
    this.dom = _$id(dom_id)
    this.dom.instance = this
  }
  to_json = () => { }
  fresh = () => { }
}

//  マンダラチャートの最小要素
class Cell {
  constructor(dom_id, json = {"subject": "", "note": "", "tags": [{"tagName": ""}]}) {
    this.dom = _$id(dom_id)
    this.dom.instance = this
    let subject = _$(".content--cell--subject", this.dom).shift()
    let note = _$(".content--cell--note", this.dom).shift()
    let tags = _$(".content--cell--note", this.dom)
    this.subject = new Subject(subject, json)
    this.note = new Note(note, json)
    this.tags = tags.map(t => new Tag(t))
  }
  to_json = () => { }
  fresh = () => {
    this.subject.fresh()
  }
}

//  セルに表示する題名。idを持たない。
class Subject {
  constructor(dom, json = {"subject": ""}) {
    this.dom = dom
    this.subject = json.subject || ""
  }
  to_json = () => { }
  fresh = () => {
    this.dom.innerHTML = this.subject
  }
}

//  セルが持つノート。idを持たない。
class Note {
  constructor(dom, json = {"note": ""}) {
    this.dom = dom
    this.note = json.note || ""
  }
  to_json = () => { }
  fresh = () => {
    this.dom.innerHTML = this.note
  }
}

//  セルに表示するタグ。idを持たない。可変長。
class Tag {
  constructor(dom, json = {"tagName": ""}) {
    this.dom = dom
    this.tagName = json.tagName || ""
  }
  to_json = () => { }
  fresh = () => {
    this.dom.innerHTML = this.tagName
  }
}  

