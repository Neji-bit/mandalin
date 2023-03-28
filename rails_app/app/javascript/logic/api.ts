import {Util} from './util'
import axios from 'axios'
//  アプリのAPI一式を定義。
//  データ読み込み／書き込みは _data を直接触る。
class Api {
  static is_synchronizing = false

  static login = (callback = null) => {
  }

  //  ログアウトしたら、なにはともあれページリロード。
  static logout = (callback = null) => {
    axios.delete(`/users/sign_out`)
    .then(() => {
      location.reload()
    })
  }

  static loadBook = (book_id, callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now. (Book)");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${book_id}`)
    .then((data) => {
      let json = JSON.parse(data.data)
      window.data.book = json.book
      window.data.app_info = json.app_info
      _data = dataRefresh()
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  static loadPage = (book_id, page_id, callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now. (Page)");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${book_id}/page/${page_id}`)
    .then((data) => {
      window.data.page = JSON.parse(data.data).page
      _undo.length = 0
      __undo.length = 0
      _data = dataRefresh()
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  static saveBook = (callback = null) => {
    let book_id = Util.urlParams().book
    let payload = {
      name: _data.book.title.data,
      text: JSON.stringify({app_info: _data.app_info, book: _data.book})
    }
    axios.put(`/api/v1/book/${book_id}`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }

  static savePage = (callback = null) => {
    let book_id = Util.urlParams().book
    let page_id = (_data.state.currentPage || "0").match(/.$/)
    let payload = {text: JSON.stringify({page: _data.page})}
    axios.put(`/api/v1/book/${book_id}/page/${page_id}`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }
}

export {Api}
