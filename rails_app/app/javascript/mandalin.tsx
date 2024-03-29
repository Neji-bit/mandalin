import React from 'react'
import { createRoot } from 'react-dom/client'
import Cell from './components/cell'
import Command from './logic/command'
import {Backboard} from './components/layout'
import {Keyboard} from './logic/keyboard'
import {ToolLogic} from './logic/tool_logic'
import {Api} from './logic/api'
import {Util, Message} from './logic/util'

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

//  アプリデータの置き場所
_data = {}

_undo = []      //  Undo履歴
__undo = []     //  「未来の歴史」。Undoで巻き戻された歴史をここに仮置きする。
UNDO_MAX = 20
_readonly = true

////////////////////////////////////////////////////////////////////////////////

Keyboard.init()

class App extends React.Component {
  componentDidMount() {
    _data.react.app = this
    Message.set("book")
  }
  render() {
    return (
      <Backboard />
    )
  }
}

function init() {
  _data.state.viewMode ||= "large"
  if(_data.state.showTag != true) _data.state.showTag = false
  if(_data.state.showSticker != true) _data.state.showSticker = false
  _data.state.selectionMode = "selection--none"
  _data.state.currentPage = `page_${Util.urlParams().page || (_data.state.currentPage || "0").match(/.$/)}`
  _data.state.currentArea ||= "area_d"
  _data.state.currentCell ||= "cell_dd"
  _data.state.currentLeftCell ||= "cell_ww"
  _data.state.currentRightCell ||= "cell_we"

  //  パレットの対象となっている要素のID
  _data.state.paletteTarget = null
  //  パレットを表示する位置
  _data.state.palettePoint = {left: 0, top: 0}
  //  現在のパレットの状態
  _data.state.paletteStickerUrl = false
  _data.state.paletteStickerMenu = false
  _data.state.paletteDesignMenu = false
  //  ステッカーの状態
  _data.state.stickerMode = "none"

  //  ホットキーによる表示ズーム値
  _data.state.hotkeyArea = null
  _data.state.hotkeyCell = null

  //  合成デザインの初期値
  let decorate = {
    back: "union--back--0",
    font_color: "union--font--color--0",
    font_style: "union--font--style--0",
    ribbon_color: "union--ribbon--color--0",
    ribbon_style: "union--ribbon--style--0"
  }
  _data.app_info.decorates ||= {}
  "0123456789abcdefghijklmnopqrstuv".split("").forEach((i) => {
    _data.app_info.decorates[`union--design--${i}`] ||= {...decorate}
  })
  //  デザイン群を表示する際の表示順。順序入替え時、（もちろん）デザインのIDは変えず、この表示順序だけを変更する仕組み。
  _data.app_info.design_sort ||= "0123456789abcdefghijklmnopqrstuv"

  //  ツールの初期値。
  _data.state.showSticker = true
  _data.state.showThumbnail= true

  //  はりつけ位置調整変数。
  _data.state.pasteSlideX = 0
  _data.state.pasteSlideY = 0

  _data.state.bookListType = "booksFavorites"
  _data.state.targetBook = {
    id: 0,
    title: "TITLE",
    thumbnail: "THUMBNAIL",
    owner: "OWNER",
    authorization: "AUTHORIZATION",
    tag: "TAG",
    text: "TEXT"
  }

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('No root element');
  }
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  _readonly = Util.is_readonly()
  _authenticated = Util.is_login()

  //  初期化時、現状を「最初の歴史」として保存する。
  ToolLogic.history()

  if(_authenticated) {
    Api.loadUserProperty(() => {
      //  ブック履歴に現在のページを登録する。
      let book_id = Number(Util.urlParams().book)
      if(book_id) {
        let list = _data.user.books.booksHistories.filter((i) => {return !(!i.id || i.id == book_id)})
        list.unshift({id: book_id, text: ""})
        list = list.splice(0, 16)
        _data.user.books.booksHistories = list
        Api.saveUserProperty()
      }
    })
  }
}
//  ブックデータ、ページデータ、ユーザープロパティデータをサーバから取得してから初期化。
window.onload = () => {
  let params = Util.urlParams()
  Api.loadBook(params.book, () => {
    let book_id = params.book || 1
    let page_id = params.page || (_data.state.currentPage || "0").match(/.$/)
    Api.loadPage(book_id, page_id, init)
  })
}

