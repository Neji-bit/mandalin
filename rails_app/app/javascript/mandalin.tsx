import React from 'react'
import { createRoot } from 'react-dom/client'
import Cell from './components/cell'
import Command from './logic/command'
import Backboard from './components/layout'
import {Keyboard} from './logic/keyboard'
import {Api} from './logic/api'
import {Util} from './logic/util'

////////////////////////////////////////////////////////////////////////////////
//  データ構造の定義。
//  _data で各要素にショートカットアクセスが可能（キーがユニークでないものは除く）。

window.data = {
//  book: {
//    title: { effect: "", data: "BOOK_TITLE", },
//    pages: {
//      page_0: { title: { effect: "", data: "PAGE_0", }, },
//      page_1: { title: { effect: "", data: "PAGE_1", }, },
//      page_2: { title: { effect: "", data: "PAGE_2", }, },
//      page_3: { title: { effect: "", data: "PAGE_3", }, },
//      page_4: { title: { effect: "", data: "PAGE_4", }, },
//      page_5: { title: { effect: "", data: "PAGE_5", }, },
//      page_6: { title: { effect: "", data: "PAGE_6", }, },
//      page_7: { title: { effect: "", data: "PAGE_7", }, },
//      page_8: { title: { effect: "", data: "PAGE_8", }, },
//      page_9: { title: { effect: "", data: "PAGE_9", }, },
//      page_a: { title: { effect: "", data: "PAGE_a", }, },
//      page_b: { title: { effect: "", data: "PAGE_b", }, },
//      page_c: { title: { effect: "", data: "PAGE_c", }, },
//      page_d: { title: { effect: "", data: "PAGE_d", }, },
//      page_e: { title: { effect: "", data: "PAGE_e", }, },
//      page_f: { title: { effect: "", data: "PAGE_f", }, },
//    },
//    state: {
//      currentPage: "page_0",
//      currentArea: "area_w",
//      currentCell: "cell_ww",
//      viewMode: "large",
//      showTag: true,
//      fullscreen: false,
//      showSticker: true,
//      selectionMode: "selection--none",
//    },
//    toolbox: {
//    }
//  },
//  page: {
//    id: "page_0",
//    title: "## PAGE_0 ##",
//    areas: {
//      area_w: {
//        cells: {
//          cell_ww: { subject: { effect: "", data: "ww_SUB", }, note: { effect: "", data: "ww_NOTE", } },
//          cell_we: { subject: { effect: "", data: "we_SUB", }, note: { effect: "", data: "we_NOTE", } },
//          cell_wr: { subject: { effect: "", data: "wr_SUB", }, note: { effect: "", data: "wr_NOTE", } },
//          cell_ws: { subject: { effect: "", data: "ws_SUB", }, note: { effect: "", data: "ws_NOTE", } },
//          cell_wd: { subject: { effect: "", data: "wd_SUB", }, note: { effect: "", data: "wd_NOTE", } },
//          cell_wf: { subject: { effect: "", data: "wf_SUB", }, note: { effect: "", data: "wf_NOTE", } },
//          cell_wz: { subject: { effect: "", data: "wz_SUB", }, note: { effect: "", data: "wz_NOTE", } },
//          cell_wx: { subject: { effect: "", data: "wx_SUB", }, note: { effect: "", data: "wx_NOTE", } },
//          cell_wc: { subject: { effect: "", data: "wc_SUB", }, note: { effect: "", data: "wc_NOTE", } },
//        },
//      },
//    },
//  },
  react: {
    app: null,
    map: null,
    toolbox: null,
    area_w: null,
    cell_ww: null,
  },
}
//  let arrows = "wersdfzxc"
//  arrows.split("").forEach((a) => {
//    window.data.page.areas[`area_${a}`] = {cells: {}}
//    let cells = window.data.page.areas[`area_${a}`].cells
//    arrows.split("").forEach((c) => {
//      cells[`cell_${a}${c}`] = { subject: { effect: "", data: `${a}${c}_SUB`, }, note: { effect: "", data: `${a}${c}_NOTE`, } }
//    })
//  })

//  「無効」を示す目印クラス。
class Nil {}

//  window.data 配下に効率良くアクセスするためのショートカット。
//  window.data を一次元の連想配列にほぐしたイメージ。
//  一意特定できない要素（＝keyが重複するケース）は、ショートカットを用意しない。
_data = {}
_dataRefresh = (entry = window.data) => {
  let result = {}
  if(entry.constructor !== Object) return result
  //  指定された連想配列を走査
  let keys = Object.keys(entry)
  keys.forEach((k) => {
    //  要素が連想配列であった場合、結果に追加＆再帰。
    if(entry[k] && entry[k].constructor === Object) {
      result[k] = entry[k]
      let sub = _dataRefresh(result[k])
      let sub_key = Object.keys(sub)
      sub_key.forEach((s) => {
        if(result[s]) {
          result[s] = new Nil()
        } else {
          result[s] = sub[s]
        }
      })
    }
  })
  return result
}
//  再帰で作ったショートカット集の仕上げ。
dataRefresh = (entry = window.data) => {
  let result = _dataRefresh(entry)
  //  走査の最初の要素もショートカット集に追加する。
  result["data"] = entry
  //  無効なショートカット（＝一意特定できなかったもの）を除外する。
  Object.keys(result).forEach((k) => {
    if(!result[k] || result[k].constructor === Nil) {
      delete result[k]
    }
  })
  return result
}

////////////////////////////////////////////////////////////////////////////////

Keyboard.init()

class App extends React.Component {
  componentDidMount() {
    _data.react.app = this
  }
  render() {
    return (
      <div>
        <Backboard />
      </div>
    )
  }
}

function init() {
  //  アプリデータ（＝window.data）の各要素へのショートカットを作る。
  _data = dataRefresh()

  _data.state.viewMode ||= "large"
  _data.state.showTag ||= true
  _data.state.showSticker ||= true

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('No root element');
  }
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
//  ブックデータ、ページデータをサーバから取得してから初期化。
window.onload = () => {
  let params = Util.urlParams()
  Api.loadBook(params.book, () => {
    Api.loadPage(params.book, params.page, init)
  })
}

